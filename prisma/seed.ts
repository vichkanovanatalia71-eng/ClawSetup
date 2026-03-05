import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@clawsetup.com" },
    update: {},
    create: {
      email: "admin@clawsetup.com",
      name: "Admin",
      passwordHash: adminPassword,
      role: "SUPERADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Promote owner to SUPERADMIN
  const ownerEmail = "vichkanovanatalia71@gmail.com";
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (owner) {
    await prisma.user.update({
      where: { email: ownerEmail },
      data: { role: "SUPERADMIN" },
    });
    console.log("Owner promoted to SUPERADMIN:", ownerEmail);
  } else {
    console.log("Owner not found (register first, then re-run seed):", ownerEmail);
  }

  // Create scenario: Remote (Google Cloud VM)
  const remoteScenario = await prisma.scenario.upsert({
    where: { slug: "remote-gcp" },
    update: {},
    create: {
      slug: "remote-gcp",
      name: "Remote: Google Cloud VM (Ubuntu)",
      description:
        "Full setup on a Google Cloud VM with Ubuntu 24.04. Includes VM creation, SSH, Node.js, OpenClaw, systemd service, Telegram, Dashboard, and backups.",
      order: 1,
    },
  });

  // Create scenario: Local
  const localScenario = await prisma.scenario.upsert({
    where: { slug: "local" },
    update: {},
    create: {
      slug: "local",
      name: "Local: Your Machine",
      description:
        "Install and run OpenClaw on your local machine (Windows/macOS/Linux). Simpler setup, no cloud required.",
      order: 2,
    },
  });

  // Modules for Remote scenario
  const modules = [
    { title: "GCP Preparation", order: 0 },
    { title: "VM Creation & SSH", order: 1 },
    { title: "System Setup", order: 2 },
    { title: "OpenClaw Installation", order: 3 },
    { title: "Service Configuration", order: 4 },
    { title: "Integrations", order: 5 },
    { title: "Operations & Maintenance", order: 6 },
  ];

  const createdModules: { id: string; title: string; order: number }[] = [];
  for (const mod of modules) {
    const created = await prisma.module.upsert({
      where: {
        id: `mod-remote-${mod.order}`,
      },
      update: { title: mod.title, order: mod.order },
      create: {
        id: `mod-remote-${mod.order}`,
        scenarioId: remoteScenario.id,
        title: mod.title,
        order: mod.order,
      },
    });
    createdModules.push(created);
  }

  // Steps
  const steps = [
    {
      moduleOrder: 0,
      title: "Step 0: GCP Project Setup",
      slug: "step-0-gcp-project-setup",
      order: 0,
      goal: "Prepare your Google Cloud project: enable billing, required APIs, create Service Account with correct IAM roles.",
      prerequisites: "A Google Cloud account. A payment method for billing.",
      contentMd: `## 0.1 Enable Billing

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Make sure the correct **Project** is selected at the top
3. Menu left → **Billing**
4. If billing is not linked — link a billing account to this Project

## 0.2 Enable Required APIs

Menu left → **APIs & Services → Library**

Enable each of these:
- \`Compute Engine API\`
- \`Cloud Resource Manager API\`
- \`Vertex AI API\`
- \`IAM Service Account Credentials API\`
- *(optional)* \`Cloud Logging API\`
- *(optional)* \`Cloud Monitoring API\`

## 0.2.1 Create Service Account (SA)

**Goal:** Give the VM official service access to Google Cloud (Vertex, logs, etc.) without JSON keys.

### A) Create SA
1. Menu left → **IAM & Admin → Service Accounts**
2. **Create Service Account**
3. Fill in:
   - Service account name: \`openclaw-vm\`
   - Description (optional)
4. **Create and Continue**

### B) Add Roles

Add these roles:
- **Minimum:** \`Vertex AI User\` (roles/aiplatform.user)
- **Recommended:** \`Service Usage Consumer\` (roles/serviceusage.serviceUsageConsumer)
- *(optional)* \`Logs Writer\` (roles/logging.logWriter)
- *(optional)* \`Monitoring Metric Writer\` (roles/monitoring.metricWriter)

Continue → Done. **Do NOT create a JSON key.**

## 0.2.2 Attach Service Account to VM + Access Scopes

> **Important:** Access scopes ≠ IAM roles. Even with correct roles, without \`cloud-platform\` scope you may get 403 \`ACCESS_TOKEN_SCOPE_INSUFFICIENT\`.

**When creating a new VM:**
- Compute Engine → Create instance → Identity and API access:
  - Service account: select your \`openclaw-vm@...\`
  - Access scopes: **Allow full access to all Cloud APIs**

**If VM already exists:**
- Compute Engine → VM instances → select VM → **Stop** → **Edit**:
  - Service account: select your SA
  - Access scopes: **Allow full access to all Cloud APIs**
  - Save → Start

## 0.3 Static IP (Optional but Recommended)

**Benefits:**
- IP doesn't change when you Stop/Start VM
- Convenient for SSH, tunnels, DNS, automations
- Saves time if you frequently turn off VM

**How to reserve:**
1. VPC network → IP addresses
2. **Reserve external static address**
3. Name: \`openclaw-static-ip\`
4. Region: your region
5. **Reserve**

## 0.4 Where to Find Project ID, Region, Zone

- **Project ID:** top of the console in Project selector, or in Project info (use Project ID, not Project name)
- **Region/Zone:** visible when creating VM (Location)`,
      expectedResult: "Billing enabled, all APIs active, Service Account created with correct roles, no JSON keys generated.",
      commonErrors: `- "Billing account not linked" — go to Billing and link it
- "API not enabled" — go to APIs & Services → Library and enable the missing API
- "ACCESS_TOKEN_SCOPE_INSUFFICIENT" — make sure VM has "Allow full access to all Cloud APIs" in access scopes
- "Permission denied" — check that the SA has the correct IAM roles`,
    },
    {
      moduleOrder: 1,
      title: "Step 1: Create VM",
      slug: "step-1-create-vm",
      order: 1,
      goal: "Create a VM instance in Google Cloud with Ubuntu 24.04, proper machine type, and attached Service Account.",
      prerequisites: "Step 0 completed: billing, APIs, and Service Account ready.",
      contentMd: `## Create VM in Console

1. **Compute Engine → VM instances → Create instance**
2. Fill in:
   - **Name:** your VM name (e.g. \`openclaw\`)
   - **Region/Zone:** choose based on location or cost
   - **Machine configuration:** minimum **2 vCPU + 4 GB RAM**
   - **Boot disk:** Ubuntu 24.04 LTS
3. **Networking → External IPv4:** select static IP (if you reserved one)
4. **Identity and API access:**
   - Service account: your SA
   - Access scopes: **Allow full access to all Cloud APIs**
5. Click **Create**

> **Note about pricing:** Different regions/zones may differ in cost by 10-30%. Choose closer for lower latency or search for cheaper options.`,
      expectedResult: "VM is created and running. Green checkmark visible in VM instances list.",
      commonErrors: `- "Quota exceeded" — request quota increase or try a different zone
- "Machine type unavailable" — try a different zone in the same region
- Forgot to attach Service Account — Stop VM, Edit, attach SA, Start`,
    },
    {
      moduleOrder: 1,
      title: "Step 2: SSH Access",
      slug: "step-2-ssh-access",
      order: 2,
      goal: "Generate SSH key, add it to GCP, connect to VM via SSH from your local terminal.",
      prerequisites: "VM created and running (Step 1).",
      contentMd: `## 2.1 Generate SSH Key (on your PC)

\`\`\`bash
ssh-keygen -t ed25519 -C "your_user@your_vm" -f ~/.ssh/openclaw_vm
\`\`\`

## 2.2 Add SSH Key to GCP

Two options:
- **Global metadata SSH keys** (for all VMs in Project): Compute Engine → Metadata → SSH Keys → Add SSH key
- **Instance-level SSH keys** (only for this VM): VM instances → your VM → Edit → SSH keys

Get your public key:
\`\`\`bash
cat ~/.ssh/openclaw_vm.pub
\`\`\`
Select the output → copy → paste into GCP.

> **Important:** Web SSH in GCP may log in under a different Linux user than your key. Files will be in different \`/home/...\` directories.

## 2.3 Connect via SSH

\`\`\`bash
ssh your_user@YOUR_IP -i ~/.ssh/openclaw_vm
\`\`\`

## 2.4 If Asked yes/no

Type \`yes\` and press Enter.

## 2.5 If VM Was Reinstalled and Host Key Changed

\`\`\`bash
ssh-keygen -R YOUR_IP
ssh-keygen -R your_vm_name
\`\`\`

Then connect again.`,
      expectedResult: "You are connected to the VM via SSH and see the Ubuntu terminal prompt.",
      commonErrors: `- "Connection refused" — VM might not be running, or SSH port (22) is blocked by firewall
- "Permission denied (publickey)" — wrong key file or username doesn't match
- "REMOTE HOST IDENTIFICATION HAS CHANGED" — remove old host key with ssh-keygen -R
- Web SSH user differs from your key user — files are in different home directories`,
    },
    {
      moduleOrder: 2,
      title: "Step 3: Prepare Ubuntu",
      slug: "step-3-prepare-ubuntu",
      order: 3,
      goal: "Update Ubuntu and install essential packages on the VM.",
      prerequisites: "Connected to VM via SSH (Step 2).",
      contentMd: `## Update and Install Packages

Run this on the VM:

\`\`\`bash
sudo apt update
sudo apt -y upgrade
sudo apt -y install curl ca-certificates jq git unzip lsb-release gnupg nano build-essential
\`\`\`

This installs all the tools needed for the next steps.`,
      expectedResult: "All packages installed without errors. System is up to date.",
      commonErrors: `- "E: Unable to locate package" — run \`sudo apt update\` first
- "dpkg was interrupted" — run \`sudo dpkg --configure -a\` then retry
- Slow download — normal for first update, wait for it to finish`,
    },
    {
      moduleOrder: 2,
      title: "Step 4: Install gcloud CLI",
      slug: "step-4-install-gcloud",
      order: 4,
      goal: "Install Google Cloud CLI on the VM.",
      prerequisites: "Step 3 completed (base packages installed).",
      contentMd: `## Install gcloud

\`\`\`bash
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \\
  | sudo gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg

echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \\
  | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list >/dev/null

sudo apt update
sudo apt -y install google-cloud-cli
gcloud --version
\`\`\``,
      expectedResult: "`gcloud --version` shows the installed version (e.g., Google Cloud SDK 4xx.x.x).",
      commonErrors: `- "GPG error" — ensure the keyring was created correctly
- "Unable to locate package google-cloud-cli" — check that the apt source was added correctly`,
    },
    {
      moduleOrder: 2,
      title: "Step 5: ADC Login",
      slug: "step-5-adc-login",
      order: 5,
      goal: "Authenticate with Google Cloud using Application Default Credentials (ADC) — no JSON keys needed.",
      prerequisites: "gcloud installed (Step 4).",
      contentMd: `## ADC Login

\`\`\`bash
LC_ALL=C.UTF-8 gcloud auth application-default login --no-launch-browser
\`\`\`

Follow the instructions: open the URL in your browser, sign in, paste the code back.

## Verify

\`\`\`bash
ls -la ~/.config/gcloud/application_default_credentials.json
gcloud auth list
gcloud config get-value project
\`\`\`

## If Project Is Wrong

\`\`\`bash
gcloud config set project YOUR_PROJECT_ID
\`\`\``,
      expectedResult: "ADC credentials file exists. `gcloud auth list` shows the correct account. Project ID matches.",
      commonErrors: `- "Could not open browser" — use --no-launch-browser flag and copy the URL manually
- Wrong project — use \`gcloud config set project\`
- "Quota exceeded" — wait and retry`,
    },
    {
      moduleOrder: 3,
      title: "Step 6: Install Node.js & OpenClaw",
      slug: "step-6-install-nodejs-openclaw",
      order: 6,
      goal: "Install Node.js 22+, configure npm for non-root global installs, and install OpenClaw.",
      prerequisites: "Steps 3-5 completed.",
      contentMd: `## Install Node.js 22

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs
node -v
npm -v
\`\`\`

## Configure npm Global Without sudo

\`\`\`bash
mkdir -p ~/.npm-global
npm config set prefix "~/.npm-global"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

## Install OpenClaw

\`\`\`bash
npm install -g openclaw
openclaw --version
command -v openclaw
\`\`\``,
      expectedResult: "`node -v` shows v22+. `openclaw --version` shows the installed version. `command -v openclaw` shows the path.",
      commonErrors: `- "command not found: openclaw" — PATH not updated, run \`source ~/.bashrc\`
- "EACCES permission denied" — npm global not configured correctly, check ~/.npm-global setup
- "node: not found" — NodeSource setup failed, retry the curl command`,
    },
    {
      moduleOrder: 3,
      title: "Step 7: Create .env for Vertex",
      slug: "step-7-env-file",
      order: 7,
      goal: "Create the environment file with Vertex AI configuration (project, region, ADC path).",
      prerequisites: "OpenClaw installed (Step 6), ADC login done (Step 5).",
      contentMd: `## Create .env File

\`\`\`bash
mkdir -p ~/.openclaw
nano ~/.openclaw/.env
\`\`\`

Paste this content (replace with your values):

\`\`\`
GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
GOOGLE_CLOUD_LOCATION="us-central1"
GOOGLE_APPLICATION_CREDENTIALS="/home/YOUR_USER/.config/gcloud/application_default_credentials.json"
\`\`\`

Save: \`Ctrl+O → Enter\`, Exit: \`Ctrl+X\`

## Secure the File

\`\`\`bash
chmod 600 ~/.openclaw/.env
ls -la ~/.openclaw/.env
\`\`\``,
      expectedResult: "File exists at `~/.openclaw/.env` with permissions `-rw-------` (600).",
      commonErrors: `- "No such file or directory" — create the directory first with \`mkdir -p ~/.openclaw\`
- Wrong path to ADC credentials — check with \`ls ~/.config/gcloud/application_default_credentials.json\`
- Forgot to replace placeholders — double-check project ID and username`,
    },
    {
      moduleOrder: 4,
      title: "Step 8: Gateway as systemd Service",
      slug: "step-8-gateway-service",
      order: 8,
      goal: "Configure OpenClaw gateway as a user-level systemd service with environment file.",
      prerequisites: "Steps 6-7 completed.",
      contentMd: `## Set Gateway Mode

\`\`\`bash
mkdir -p ~/.openclaw
[ -f ~/.openclaw/openclaw.json ] || echo "{}" > ~/.openclaw/openclaw.json

tmp=$(mktemp)
jq '.gateway = (.gateway // {}) | .gateway.mode = "local"' ~/.openclaw/openclaw.json > "$tmp" && mv "$tmp" ~/.openclaw/openclaw.json
\`\`\`

## Install Gateway Service

\`\`\`bash
openclaw setup
openclaw gateway install
\`\`\`

## Add Environment File to Service

\`\`\`bash
mkdir -p ~/.config/systemd/user/openclaw-gateway.service.d
cat > ~/.config/systemd/user/openclaw-gateway.service.d/env.conf <<'EOF'
[Service]
EnvironmentFile=%h/.openclaw/.env
EOF
systemctl --user daemon-reload
\`\`\`

## Start and Verify

\`\`\`bash
systemctl --user restart openclaw-gateway.service
sleep 20
openclaw gateway status --timeout 3000
ss -ltnp | grep 18789 || true
curl -I http://127.0.0.1:18789/ | head
\`\`\``,
      expectedResult: "Gateway is running and listening on port 18789. `curl` returns a response.",
      commonErrors: `- "Unit not found" — run \`openclaw gateway install\` again
- Port 18789 not listening — check \`journalctl --user -u openclaw-gateway.service -n 50\`
- Environment variables not loaded — check the env.conf drop-in file`,
    },
    {
      moduleOrder: 4,
      title: "Step 9: Auto-start After Reboot",
      slug: "step-9-autostart",
      order: 9,
      goal: "Enable lingering and auto-start so the gateway survives reboots.",
      prerequisites: "Gateway service running (Step 8).",
      contentMd: `## Enable Linger and Auto-start

\`\`\`bash
sudo loginctl enable-linger $USER
systemctl --user enable openclaw-gateway.service
systemctl --user restart openclaw-gateway.service
sleep 20
openclaw gateway status --timeout 3000
\`\`\``,
      expectedResult: "Service is enabled. After reboot, the gateway starts automatically.",
      commonErrors: `- "Failed to enable linger" — need sudo
- Service doesn't start after reboot — check \`loginctl show-user $USER\` for Linger=yes`,
    },
    {
      moduleOrder: 5,
      title: "Step 10: Onboard",
      slug: "step-10-onboard",
      order: 10,
      goal: "Run the onboard wizard to configure AI models (Vertex/OpenAI).",
      prerequisites: "Gateway running (Step 9).",
      contentMd: `## Run Onboard

\`\`\`bash
openclaw onboard
\`\`\`

> If onboard asks to install daemon/gateway again — **skip** (gateway is already running).

### Model Selection

**For Vertex/Gemini:**
- On the first model screen, where you see OpenAI/Codex at the top, choose **"skip for now"**
- Then select **google-vertex** and a default cheap model

**For OpenAI/Codex (if you have a ChatGPT subscription):**
- Select OpenAI → Codex OAuth
- You'll get a link — open it in your browser
- Log in, after redirect you'll see a page/error with localhost
- **Copy the full URL** from the address bar and paste it into the terminal
- Then choose a default model`,
      expectedResult: "Onboard completed. Models configured. `openclaw models list` shows available models.",
      commonErrors: `- "Failed to connect to gateway" — make sure gateway is running
- Codex OAuth redirect fails — copy the FULL localhost URL including all parameters
- "Invalid token" — try the OAuth flow again`,
    },
    {
      moduleOrder: 5,
      title: "Step 11: Create Telegram Bot",
      slug: "step-11-telegram-bot",
      order: 11,
      goal: "Create a Telegram bot via BotFather and get the bot token.",
      prerequisites: "Telegram account.",
      contentMd: `## Create Bot

1. Open Telegram
2. Find **@BotFather**
3. Send \`/newbot\`
4. Choose a **name** for your bot
5. Choose a **username** (must end in \`bot\`)
6. Copy the **TELEGRAM_BOT_TOKEN** that BotFather gives you

> Keep this token secure. Anyone with this token can control your bot.`,
      expectedResult: "You have a Telegram bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`).",
      commonErrors: `- "Username already taken" — try a different username
- Can't find BotFather — search for @BotFather (with capital B and F)`,
    },
    {
      moduleOrder: 5,
      title: "Step 12: Telegram Pairing",
      slug: "step-12-telegram-pairing",
      order: 12,
      goal: "Connect your Telegram bot to OpenClaw and verify the connection.",
      prerequisites: "Steps 10-11 completed (onboard done, bot token ready).",
      contentMd: `## Pair Telegram

1. Send any message to your bot in Telegram (e.g. \`/start\`)
2. You'll receive a **pairing code** and/or a ready command
3. If the bot gave you a command — just copy and paste it into the VM terminal
4. If you only got a code:

\`\`\`bash
openclaw pairing approve telegram YOUR_CODE
\`\`\`

## Restart Gateway After Onboard

\`\`\`bash
systemctl --user restart openclaw-gateway.service
sleep 20
openclaw status
openclaw models list
openclaw models status
\`\`\``,
      expectedResult: "Telegram bot responds to messages. `openclaw status` shows Telegram connected.",
      commonErrors: `- "Pairing code expired" — generate a new one by sending /start again
- Bot doesn't respond — check that gateway is running and onboard was completed`,
    },
    {
      moduleOrder: 6,
      title: "Step 13: Dashboard via SSH Tunnel",
      slug: "step-13-dashboard",
      order: 13,
      goal: "Access the OpenClaw Dashboard (web UI) securely through an SSH tunnel — without opening ports to the internet.",
      prerequisites: "Gateway running (Step 9).",
      contentMd: `## Start SSH Tunnel (on your PC)

\`\`\`bash
ssh -L 18789:127.0.0.1:18789 your_user@YOUR_IP -i ~/.ssh/openclaw_vm
\`\`\`

## Open Dashboard

In your browser on your PC:
\`\`\`
http://127.0.0.1:18789/
\`\`\`

## If You See "gateway token missing"

1. On the VM, get the token:

\`\`\`bash
jq -r ".gateway.auth.token" ~/.openclaw/openclaw.json
\`\`\`

2. Copy it (select → Enter in terminal)
3. In the Dashboard → Control → Overview → **Gateway token** field → paste → **Connect**`,
      expectedResult: "Dashboard opens in your browser and shows the OpenClaw control panel.",
      commonErrors: `- "Connection refused" on localhost — SSH tunnel not running, or gateway is down
- "1008 unauthorized: gateway token missing" — enter the token from openclaw.json
- Port already in use — another tunnel or process is using 18789`,
    },
    {
      moduleOrder: 6,
      title: "Step 14: Verify Vertex",
      slug: "step-14-verify-vertex",
      order: 14,
      goal: "Verify that Vertex AI models are accessible and working.",
      prerequisites: "Onboard completed (Step 10).",
      contentMd: `## Check Models

\`\`\`bash
openclaw models list
openclaw models status
openclaw status
\`\`\`

All commands should show models available and connected status.`,
      expectedResult: "Models are listed. Status shows 'connected' or 'ready'.",
      commonErrors: `- "No models found" — re-run \`openclaw onboard\`
- "403 Permission denied" — check Service Account roles and access scopes
- "SCOPE_INSUFFICIENT" — VM needs "Allow full access to all Cloud APIs"`,
    },
    {
      moduleOrder: 6,
      title: "Step 15: Diagnostics",
      slug: "step-15-diagnostics",
      order: 15,
      goal: "Run diagnostic commands to check the overall system health.",
      prerequisites: "All previous steps completed.",
      contentMd: `## Run Diagnostics

\`\`\`bash
openclaw gateway status --timeout 3000
ss -ltnp | grep 18789 || true
curl -I http://127.0.0.1:18789/ | head || true
journalctl --user -u openclaw-gateway.service -n 200 --no-pager
\`\`\`

Review the output for any errors or warnings.`,
      expectedResult: "Gateway running, port 18789 listening, no critical errors in logs.",
      commonErrors: `- Gateway not running — \`systemctl --user restart openclaw-gateway.service\`
- Port not listening — check logs with journalctl
- Errors in logs — read the specific error and refer to the relevant step`,
    },
    {
      moduleOrder: 6,
      title: "Step 16: Basic SSH Security",
      slug: "step-16-ssh-security",
      order: 16,
      goal: "Set up basic firewall (UFW) and brute-force protection (fail2ban).",
      prerequisites: "VM accessible via SSH.",
      contentMd: `## Install and Configure

\`\`\`bash
sudo apt -y install ufw fail2ban

sudo ufw allow OpenSSH
sudo ufw --force enable
sudo ufw status

sudo systemctl enable --now fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd || true
\`\`\``,
      expectedResult: "UFW is active with SSH allowed. fail2ban is running and monitoring SSH.",
      commonErrors: `- "Locked out" — if you accidentally block SSH, use the GCP web console to connect and fix UFW rules
- fail2ban not starting — check \`systemctl status fail2ban\` for errors`,
    },
    {
      moduleOrder: 6,
      title: "Step 17: Create Backup",
      slug: "step-17-backup",
      order: 17,
      goal: "Create a VM backup (snapshot or machine image) so you can safely experiment and restore if needed.",
      prerequisites: "Everything is working (Steps 0-16).",
      contentMd: `## Why Backup Now?

At this point everything is working. Before making further changes, create a backup so you can restore within 5-10 minutes if something breaks.

## Option A: Snapshot (Recommended)

1. Google Cloud Console → **Compute Engine → Disks**
2. Find your VM's boot disk
3. Click the disk → **Create snapshot**
4. Name: \`openclaw-boot-YYYYMMDD-HHMM\`
5. Snapshot type: **STANDARD**
6. Click **Create**

> **Naming tip:** Name snapshots to show what they're "before": \`openclaw-before-caddy-change-20240115\`

## Restore from Snapshot

1. **Compute Engine → Snapshots**
2. Find your snapshot → **Create disk**
3. Create a **new VM** with this disk as boot disk

## Option B: Machine Image (Full VM Backup)

1. **Compute Engine → VM instances**
2. Select your VM → **More actions → Create machine image**
3. Name: \`openclaw-machine-image-YYYYMMDD\`
4. **Create**

To restore: **Machine images → select image → Create instance**

## Via gcloud CLI (Optional)

\`\`\`bash
# Create snapshot
gcloud compute snapshots create SNAPSHOT_NAME \\
  --source-disk=DISK_NAME \\
  --source-disk-zone=ZONE

# Create disk from snapshot (for restore)
gcloud compute disks create NEW_DISK_NAME \\
  --source-snapshot=SNAPSHOT_NAME \\
  --zone=ZONE
\`\`\``,
      expectedResult: "A snapshot or machine image exists that you can use to restore the VM at any time.",
      commonErrors: `- "Disk is in use" — you don't need to stop the VM for snapshots, they work on running VMs
- "Insufficient permissions" — make sure your GCP account has compute.snapshots.create permission`,
    },
  ];

  for (const stepData of steps) {
    const mod = createdModules.find((m) => m.order === stepData.moduleOrder);
    if (!mod) continue;

    await prisma.step.upsert({
      where: { moduleId_slug: { moduleId: mod.id, slug: stepData.slug } },
      update: {
        title: stepData.title,
        goal: stepData.goal,
        prerequisites: stepData.prerequisites,
        contentMd: stepData.contentMd,
        expectedResult: stepData.expectedResult,
        commonErrors: stepData.commonErrors,
        order: stepData.order,
        status: "PUBLISHED",
        tags: ["remote", "ubuntu", "gcp"],
      },
      create: {
        moduleId: mod.id,
        title: stepData.title,
        slug: stepData.slug,
        goal: stepData.goal,
        prerequisites: stepData.prerequisites,
        contentMd: stepData.contentMd,
        expectedResult: stepData.expectedResult,
        commonErrors: stepData.commonErrors,
        order: stepData.order,
        status: "PUBLISHED",
        tags: ["remote", "ubuntu", "gcp"],
      },
    });
  }

  // Give admin a subscription for testing
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      status: "ACTIVE",
      plan: "monthly",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Seeded ${steps.length} steps across ${modules.length} modules.`);
  console.log("Admin login: admin@clawsetup.com / admin123456");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
