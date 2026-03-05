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
      nameUk: "Віддалено: Google Cloud VM (Ubuntu)",
      description:
        "Full setup on a Google Cloud VM with Ubuntu 24.04. Includes VM creation, SSH, Node.js, OpenClaw, systemd service, Telegram, Dashboard, and backups.",
      descriptionUk:
        "Повне налаштування на Google Cloud VM з Ubuntu 24.04. Включає створення VM, SSH, Node.js, OpenClaw, systemd сервіс, Telegram, Dashboard та резервні копії.",
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
      nameUk: "Локально: Ваш комп'ютер",
      description:
        "Install and run OpenClaw on your local machine (Windows/macOS/Linux). Simpler setup, no cloud required.",
      descriptionUk:
        "Встановлення та запуск OpenClaw на вашому локальному комп'ютері (Windows/macOS/Linux). Простіше налаштування, хмара не потрібна.",
      order: 2,
    },
  });

  // Modules for Remote scenario
  const modules = [
    { title: "GCP Preparation", titleUk: "Підготовка GCP", order: 0 },
    { title: "VM Creation & SSH", titleUk: "Створення VM та SSH", order: 1 },
    { title: "System Setup", titleUk: "Налаштування системи", order: 2 },
    { title: "OpenClaw Installation", titleUk: "Встановлення OpenClaw", order: 3 },
    { title: "Service Configuration", titleUk: "Налаштування сервісу", order: 4 },
    { title: "Integrations", titleUk: "Інтеграції", order: 5 },
    { title: "Operations & Maintenance", titleUk: "Операції та обслуговування", order: 6 },
  ];

  const createdModules: { id: string; title: string; order: number }[] = [];
  for (const mod of modules) {
    const created = await prisma.module.upsert({
      where: {
        id: `mod-remote-${mod.order}`,
      },
      update: { title: mod.title, titleUk: mod.titleUk, order: mod.order },
      create: {
        id: `mod-remote-${mod.order}`,
        scenarioId: remoteScenario.id,
        title: mod.title,
        titleUk: mod.titleUk,
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
      titleUk: "Крок 0: Налаштування проекту GCP",
      slug: "step-0-gcp-project-setup",
      order: 0,
      goal: "Prepare your Google Cloud project: enable billing, required APIs, create Service Account with correct IAM roles.",
      goalUk: "Підготуйте проект Google Cloud: увімкніть білінг, необхідні API, створіть Service Account з правильними ролями IAM.",
      prerequisites: "A Google Cloud account. A payment method for billing.",
      prerequisitesUk: "Обліковий запис Google Cloud. Спосіб оплати для білінгу.",
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
      expectedResultUk: "Білінг увімкнено, всі API активні, Service Account створено з правильними ролями, JSON-ключі не генерувалися.",
      commonErrors: `- "Billing account not linked" — go to Billing and link it
- "API not enabled" — go to APIs & Services → Library and enable the missing API
- "ACCESS_TOKEN_SCOPE_INSUFFICIENT" — make sure VM has "Allow full access to all Cloud APIs" in access scopes
- "Permission denied" — check that the SA has the correct IAM roles`,
      commonErrorsUk: `- "Billing account not linked" — перейдіть до Billing та прив'яжіть його
- "API not enabled" — перейдіть до APIs & Services → Library та увімкніть потрібний API
- "ACCESS_TOKEN_SCOPE_INSUFFICIENT" — переконайтеся, що VM має "Allow full access to all Cloud APIs" в access scopes
- "Permission denied" — перевірте, що SA має правильні ролі IAM`,
    },
    {
      moduleOrder: 1,
      title: "Step 1: Create VM",
      titleUk: "Крок 1: Створення VM",
      slug: "step-1-create-vm",
      order: 1,
      goal: "Create a VM instance in Google Cloud with Ubuntu 24.04, proper machine type, and attached Service Account.",
      goalUk: "Створіть екземпляр VM у Google Cloud з Ubuntu 24.04, правильним типом машини та прикріпленим Service Account.",
      prerequisites: "Step 0 completed: billing, APIs, and Service Account ready.",
      prerequisitesUk: "Крок 0 завершено: білінг, API та Service Account готові.",
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
      expectedResultUk: "VM створено та запущено. Зелена галочка видима у списку VM instances.",
      commonErrors: `- "Quota exceeded" — request quota increase or try a different zone
- "Machine type unavailable" — try a different zone in the same region
- Forgot to attach Service Account — Stop VM, Edit, attach SA, Start`,
      commonErrorsUk: `- "Quota exceeded" — запросіть збільшення квоти або спробуйте іншу зону
- "Machine type unavailable" — спробуйте іншу зону в тому ж регіоні
- Забули прикріпити Service Account — Зупиніть VM, Edit, прикріпіть SA, Start`,
    },
    {
      moduleOrder: 1,
      title: "Step 2: SSH Access",
      titleUk: "Крок 2: SSH-доступ",
      slug: "step-2-ssh-access",
      order: 2,
      goal: "Generate SSH key, add it to GCP, connect to VM via SSH from your local terminal.",
      goalUk: "Згенеруйте SSH-ключ, додайте його в GCP, підключіться до VM через SSH з локального терміналу.",
      prerequisites: "VM created and running (Step 1).",
      prerequisitesUk: "VM створено та запущено (Крок 1).",
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
      expectedResultUk: "Ви підключені до VM через SSH і бачите термінал Ubuntu.",
      commonErrors: `- "Connection refused" — VM might not be running, or SSH port (22) is blocked by firewall
- "Permission denied (publickey)" — wrong key file or username doesn't match
- "REMOTE HOST IDENTIFICATION HAS CHANGED" — remove old host key with ssh-keygen -R
- Web SSH user differs from your key user — files are in different home directories`,
      commonErrorsUk: `- "Connection refused" — VM може не працювати, або порт SSH (22) заблокований фаєрволом
- "Permission denied (publickey)" — неправильний файл ключа або ім'я користувача не збігається
- "REMOTE HOST IDENTIFICATION HAS CHANGED" — видаліть старий ключ хоста через ssh-keygen -R
- Веб-SSH користувач відрізняється від вашого ключового — файли в різних home-директоріях`,
    },
    {
      moduleOrder: 2,
      title: "Step 3: Prepare Ubuntu",
      titleUk: "Крок 3: Підготовка Ubuntu",
      slug: "step-3-prepare-ubuntu",
      order: 3,
      goal: "Update Ubuntu and install essential packages on the VM.",
      goalUk: "Оновіть Ubuntu та встановіть необхідні пакети на VM.",
      prerequisites: "Connected to VM via SSH (Step 2).",
      prerequisitesUk: "Підключено до VM через SSH (Крок 2).",
      contentMd: `## Update and Install Packages

Run this on the VM:

\`\`\`bash
sudo apt update
sudo apt -y upgrade
sudo apt -y install curl ca-certificates jq git unzip lsb-release gnupg nano build-essential
\`\`\`

This installs all the tools needed for the next steps.`,
      expectedResult: "All packages installed without errors. System is up to date.",
      expectedResultUk: "Всі пакети встановлені без помилок. Система оновлена.",
      commonErrors: `- "E: Unable to locate package" — run \`sudo apt update\` first
- "dpkg was interrupted" — run \`sudo dpkg --configure -a\` then retry
- Slow download — normal for first update, wait for it to finish`,
      commonErrorsUk: `- "E: Unable to locate package" — спочатку виконайте \`sudo apt update\`
- "dpkg was interrupted" — виконайте \`sudo dpkg --configure -a\` та повторіть
- Повільне завантаження — нормально для першого оновлення, дочекайтесь завершення`,
    },
    {
      moduleOrder: 2,
      title: "Step 4: Install gcloud CLI",
      titleUk: "Крок 4: Встановлення gcloud CLI",
      slug: "step-4-install-gcloud",
      order: 4,
      goal: "Install Google Cloud CLI on the VM.",
      goalUk: "Встановіть Google Cloud CLI на VM.",
      prerequisites: "Step 3 completed (base packages installed).",
      prerequisitesUk: "Крок 3 завершено (базові пакети встановлені).",
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
      expectedResultUk: "`gcloud --version` показує встановлену версію (напр., Google Cloud SDK 4xx.x.x).",
      commonErrors: `- "GPG error" — ensure the keyring was created correctly
- "Unable to locate package google-cloud-cli" — check that the apt source was added correctly`,
      commonErrorsUk: `- "GPG error" — переконайтеся, що keyring створено правильно
- "Unable to locate package google-cloud-cli" — перевірте, що apt-джерело додано правильно`,
    },
    {
      moduleOrder: 2,
      title: "Step 5: ADC Login",
      titleUk: "Крок 5: ADC-авторизація",
      slug: "step-5-adc-login",
      order: 5,
      goal: "Authenticate with Google Cloud using Application Default Credentials (ADC) — no JSON keys needed.",
      goalUk: "Автентифікуйтесь у Google Cloud через Application Default Credentials (ADC) — без JSON-ключів.",
      prerequisites: "gcloud installed (Step 4).",
      prerequisitesUk: "gcloud встановлено (Крок 4).",
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
      expectedResultUk: "Файл ADC-облікових даних існує. `gcloud auth list` показує правильний обліковий запис. Project ID збігається.",
      commonErrors: `- "Could not open browser" — use --no-launch-browser flag and copy the URL manually
- Wrong project — use \`gcloud config set project\`
- "Quota exceeded" — wait and retry`,
      commonErrorsUk: `- "Could not open browser" — використовуйте прапор --no-launch-browser та скопіюйте URL вручну
- Неправильний проект — використовуйте \`gcloud config set project\`
- "Quota exceeded" — зачекайте та повторіть`,
    },
    {
      moduleOrder: 3,
      title: "Step 6: Install Node.js & OpenClaw",
      titleUk: "Крок 6: Встановлення Node.js та OpenClaw",
      slug: "step-6-install-nodejs-openclaw",
      order: 6,
      goal: "Install Node.js 22+, configure npm for non-root global installs, and install OpenClaw.",
      goalUk: "Встановіть Node.js 22+, налаштуйте npm для глобальних встановлень без root, та встановіть OpenClaw.",
      prerequisites: "Steps 3-5 completed.",
      prerequisitesUk: "Кроки 3-5 завершені.",
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
      expectedResultUk: "`node -v` показує v22+. `openclaw --version` показує встановлену версію. `command -v openclaw` показує шлях.",
      commonErrors: `- "command not found: openclaw" — PATH not updated, run \`source ~/.bashrc\`
- "EACCES permission denied" — npm global not configured correctly, check ~/.npm-global setup
- "node: not found" — NodeSource setup failed, retry the curl command`,
      commonErrorsUk: `- "command not found: openclaw" — PATH не оновлений, виконайте \`source ~/.bashrc\`
- "EACCES permission denied" — npm global налаштовано неправильно, перевірте ~/.npm-global
- "node: not found" — налаштування NodeSource не вдалося, повторіть команду curl`,
    },
    {
      moduleOrder: 3,
      title: "Step 7: Create .env for Vertex",
      titleUk: "Крок 7: Створення .env для Vertex",
      slug: "step-7-env-file",
      order: 7,
      goal: "Create the environment file with Vertex AI configuration (project, region, ADC path).",
      goalUk: "Створіть файл середовища з конфігурацією Vertex AI (проект, регіон, шлях ADC).",
      prerequisites: "OpenClaw installed (Step 6), ADC login done (Step 5).",
      prerequisitesUk: "OpenClaw встановлено (Крок 6), ADC-авторизація виконана (Крок 5).",
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
      expectedResultUk: "Файл існує за шляхом `~/.openclaw/.env` з правами `-rw-------` (600).",
      commonErrors: `- "No such file or directory" — create the directory first with \`mkdir -p ~/.openclaw\`
- Wrong path to ADC credentials — check with \`ls ~/.config/gcloud/application_default_credentials.json\`
- Forgot to replace placeholders — double-check project ID and username`,
      commonErrorsUk: `- "No such file or directory" — спочатку створіть директорію \`mkdir -p ~/.openclaw\`
- Неправильний шлях до ADC-облікових даних — перевірте \`ls ~/.config/gcloud/application_default_credentials.json\`
- Забули замінити плейсхолдери — перевірте project ID та ім'я користувача`,
    },
    {
      moduleOrder: 4,
      title: "Step 8: Gateway as systemd Service",
      titleUk: "Крок 8: Gateway як systemd-сервіс",
      slug: "step-8-gateway-service",
      order: 8,
      goal: "Configure OpenClaw gateway as a user-level systemd service with environment file.",
      goalUk: "Налаштуйте OpenClaw gateway як systemd-сервіс рівня користувача з файлом середовища.",
      prerequisites: "Steps 6-7 completed.",
      prerequisitesUk: "Кроки 6-7 завершені.",
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
      expectedResultUk: "Gateway працює та слухає порт 18789. `curl` повертає відповідь.",
      commonErrors: `- "Unit not found" — run \`openclaw gateway install\` again
- Port 18789 not listening — check \`journalctl --user -u openclaw-gateway.service -n 50\`
- Environment variables not loaded — check the env.conf drop-in file`,
      commonErrorsUk: `- "Unit not found" — виконайте \`openclaw gateway install\` знову
- Порт 18789 не слухає — перевірте \`journalctl --user -u openclaw-gateway.service -n 50\`
- Змінні середовища не завантажені — перевірте файл env.conf`,
    },
    {
      moduleOrder: 4,
      title: "Step 9: Auto-start After Reboot",
      titleUk: "Крок 9: Автозапуск після перезавантаження",
      slug: "step-9-autostart",
      order: 9,
      goal: "Enable lingering and auto-start so the gateway survives reboots.",
      goalUk: "Увімкніть lingering та автозапуск, щоб gateway переживав перезавантаження.",
      prerequisites: "Gateway service running (Step 8).",
      prerequisitesUk: "Gateway-сервіс працює (Крок 8).",
      contentMd: `## Enable Linger and Auto-start

\`\`\`bash
sudo loginctl enable-linger $USER
systemctl --user enable openclaw-gateway.service
systemctl --user restart openclaw-gateway.service
sleep 20
openclaw gateway status --timeout 3000
\`\`\``,
      expectedResult: "Service is enabled. After reboot, the gateway starts automatically.",
      expectedResultUk: "Сервіс увімкнено. Після перезавантаження gateway запускається автоматично.",
      commonErrors: `- "Failed to enable linger" — need sudo
- Service doesn't start after reboot — check \`loginctl show-user $USER\` for Linger=yes`,
      commonErrorsUk: `- "Failed to enable linger" — потрібен sudo
- Сервіс не запускається після перезавантаження — перевірте \`loginctl show-user $USER\` на Linger=yes`,
    },
    {
      moduleOrder: 5,
      title: "Step 10: Onboard",
      titleUk: "Крок 10: Onboard",
      slug: "step-10-onboard",
      order: 10,
      goal: "Run the onboard wizard to configure AI models (Vertex/OpenAI).",
      goalUk: "Запустіть майстер onboard для налаштування AI-моделей (Vertex/OpenAI).",
      prerequisites: "Gateway running (Step 9).",
      prerequisitesUk: "Gateway працює (Крок 9).",
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
      expectedResultUk: "Onboard завершено. Моделі налаштовані. `openclaw models list` показує доступні моделі.",
      commonErrors: `- "Failed to connect to gateway" — make sure gateway is running
- Codex OAuth redirect fails — copy the FULL localhost URL including all parameters
- "Invalid token" — try the OAuth flow again`,
      commonErrorsUk: `- "Failed to connect to gateway" — переконайтеся, що gateway працює
- Codex OAuth редирект не працює — скопіюйте ПОВНИЙ localhost URL включно з усіма параметрами
- "Invalid token" — спробуйте OAuth-процес знову`,
    },
    {
      moduleOrder: 5,
      title: "Step 11: Create Telegram Bot",
      titleUk: "Крок 11: Створення Telegram-бота",
      slug: "step-11-telegram-bot",
      order: 11,
      goal: "Create a Telegram bot via BotFather and get the bot token.",
      goalUk: "Створіть Telegram-бота через BotFather та отримайте токен бота.",
      prerequisites: "Telegram account.",
      prerequisitesUk: "Обліковий запис Telegram.",
      contentMd: `## Create Bot

1. Open Telegram
2. Find **@BotFather**
3. Send \`/newbot\`
4. Choose a **name** for your bot
5. Choose a **username** (must end in \`bot\`)
6. Copy the **TELEGRAM_BOT_TOKEN** that BotFather gives you

> Keep this token secure. Anyone with this token can control your bot.`,
      expectedResult: "You have a Telegram bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`).",
      expectedResultUk: "У вас є токен Telegram-бота (виглядає як `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`).",
      commonErrors: `- "Username already taken" — try a different username
- Can't find BotFather — search for @BotFather (with capital B and F)`,
      commonErrorsUk: `- "Username already taken" — спробуйте інше ім'я користувача
- Не можете знайти BotFather — шукайте @BotFather (з великими B і F)`,
    },
    {
      moduleOrder: 5,
      title: "Step 12: Telegram Pairing",
      titleUk: "Крок 12: Підключення Telegram",
      slug: "step-12-telegram-pairing",
      order: 12,
      goal: "Connect your Telegram bot to OpenClaw and verify the connection.",
      goalUk: "Підключіть вашого Telegram-бота до OpenClaw та перевірте з'єднання.",
      prerequisites: "Steps 10-11 completed (onboard done, bot token ready).",
      prerequisitesUk: "Кроки 10-11 завершені (onboard виконано, токен бота готовий).",
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
      expectedResultUk: "Telegram-бот відповідає на повідомлення. `openclaw status` показує Telegram підключено.",
      commonErrors: `- "Pairing code expired" — generate a new one by sending /start again
- Bot doesn't respond — check that gateway is running and onboard was completed`,
      commonErrorsUk: `- "Pairing code expired" — згенеруйте новий, надіславши /start знову
- Бот не відповідає — перевірте, що gateway працює та onboard завершено`,
    },
    {
      moduleOrder: 6,
      title: "Step 13: Dashboard via SSH Tunnel",
      titleUk: "Крок 13: Dashboard через SSH-тунель",
      slug: "step-13-dashboard",
      order: 13,
      goal: "Access the OpenClaw Dashboard (web UI) securely through an SSH tunnel — without opening ports to the internet.",
      goalUk: "Отримайте доступ до OpenClaw Dashboard (веб-інтерфейс) безпечно через SSH-тунель — без відкриття портів в інтернет.",
      prerequisites: "Gateway running (Step 9).",
      prerequisitesUk: "Gateway працює (Крок 9).",
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
      expectedResultUk: "Dashboard відкривається у браузері та показує панель керування OpenClaw.",
      commonErrors: `- "Connection refused" on localhost — SSH tunnel not running, or gateway is down
- "1008 unauthorized: gateway token missing" — enter the token from openclaw.json
- Port already in use — another tunnel or process is using 18789`,
      commonErrorsUk: `- "Connection refused" на localhost — SSH-тунель не запущено, або gateway не працює
- "1008 unauthorized: gateway token missing" — введіть токен з openclaw.json
- Порт вже зайнятий — інший тунель або процес використовує 18789`,
    },
    {
      moduleOrder: 6,
      title: "Step 14: Verify Vertex",
      titleUk: "Крок 14: Перевірка Vertex",
      slug: "step-14-verify-vertex",
      order: 14,
      goal: "Verify that Vertex AI models are accessible and working.",
      goalUk: "Перевірте, що моделі Vertex AI доступні та працюють.",
      prerequisites: "Onboard completed (Step 10).",
      prerequisitesUk: "Onboard завершено (Крок 10).",
      contentMd: `## Check Models

\`\`\`bash
openclaw models list
openclaw models status
openclaw status
\`\`\`

All commands should show models available and connected status.`,
      expectedResult: "Models are listed. Status shows 'connected' or 'ready'.",
      expectedResultUk: "Моделі відображаються. Статус показує 'connected' або 'ready'.",
      commonErrors: `- "No models found" — re-run \`openclaw onboard\`
- "403 Permission denied" — check Service Account roles and access scopes
- "SCOPE_INSUFFICIENT" — VM needs "Allow full access to all Cloud APIs"`,
      commonErrorsUk: `- "No models found" — повторіть \`openclaw onboard\`
- "403 Permission denied" — перевірте ролі Service Account та access scopes
- "SCOPE_INSUFFICIENT" — VM потребує "Allow full access to all Cloud APIs"`,
    },
    {
      moduleOrder: 6,
      title: "Step 15: Diagnostics",
      titleUk: "Крок 15: Діагностика",
      slug: "step-15-diagnostics",
      order: 15,
      goal: "Run diagnostic commands to check the overall system health.",
      goalUk: "Запустіть діагностичні команди для перевірки загального стану системи.",
      prerequisites: "All previous steps completed.",
      prerequisitesUk: "Всі попередні кроки завершені.",
      contentMd: `## Run Diagnostics

\`\`\`bash
openclaw gateway status --timeout 3000
ss -ltnp | grep 18789 || true
curl -I http://127.0.0.1:18789/ | head || true
journalctl --user -u openclaw-gateway.service -n 200 --no-pager
\`\`\`

Review the output for any errors or warnings.`,
      expectedResult: "Gateway running, port 18789 listening, no critical errors in logs.",
      expectedResultUk: "Gateway працює, порт 18789 слухає, критичних помилок у логах немає.",
      commonErrors: `- Gateway not running — \`systemctl --user restart openclaw-gateway.service\`
- Port not listening — check logs with journalctl
- Errors in logs — read the specific error and refer to the relevant step`,
      commonErrorsUk: `- Gateway не працює — \`systemctl --user restart openclaw-gateway.service\`
- Порт не слухає — перевірте логи через journalctl
- Помилки в логах — прочитайте конкретну помилку та зверніться до відповідного кроку`,
    },
    {
      moduleOrder: 6,
      title: "Step 16: Basic SSH Security",
      titleUk: "Крок 16: Базова безпека SSH",
      slug: "step-16-ssh-security",
      order: 16,
      goal: "Set up basic firewall (UFW) and brute-force protection (fail2ban).",
      goalUk: "Налаштуйте базовий фаєрвол (UFW) та захист від брутфорсу (fail2ban).",
      prerequisites: "VM accessible via SSH.",
      prerequisitesUk: "VM доступна через SSH.",
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
      expectedResultUk: "UFW активний з дозволом SSH. fail2ban працює та моніторить SSH.",
      commonErrors: `- "Locked out" — if you accidentally block SSH, use the GCP web console to connect and fix UFW rules
- fail2ban not starting — check \`systemctl status fail2ban\` for errors`,
      commonErrorsUk: `- "Заблоковані" — якщо випадково заблокували SSH, використовуйте GCP веб-консоль для підключення та виправлення правил UFW
- fail2ban не запускається — перевірте \`systemctl status fail2ban\` на помилки`,
    },
    {
      moduleOrder: 6,
      title: "Step 17: Create Backup",
      titleUk: "Крок 17: Створення резервної копії",
      slug: "step-17-backup",
      order: 17,
      goal: "Create a VM backup (snapshot or machine image) so you can safely experiment and restore if needed.",
      goalUk: "Створіть резервну копію VM (snapshot або machine image), щоб безпечно експериментувати та відновити за потреби.",
      prerequisites: "Everything is working (Steps 0-16).",
      prerequisitesUk: "Все працює (Кроки 0-16).",
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
      expectedResultUk: "Snapshot або machine image існує, який можна використати для відновлення VM у будь-який час.",
      commonErrors: `- "Disk is in use" — you don't need to stop the VM for snapshots, they work on running VMs
- "Insufficient permissions" — make sure your GCP account has compute.snapshots.create permission`,
      commonErrorsUk: `- "Disk is in use" — не потрібно зупиняти VM для snapshots, вони працюють на запущених VM
- "Insufficient permissions" — переконайтеся, що ваш GCP-обліковий запис має дозвіл compute.snapshots.create`,
    },
  ];

  for (const stepData of steps) {
    const mod = createdModules.find((m) => m.order === stepData.moduleOrder);
    if (!mod) continue;

    await prisma.step.upsert({
      where: { moduleId_slug: { moduleId: mod.id, slug: stepData.slug } },
      update: {
        title: stepData.title,
        titleUk: (stepData as any).titleUk || null,
        goal: stepData.goal,
        goalUk: (stepData as any).goalUk || null,
        prerequisites: stepData.prerequisites,
        prerequisitesUk: (stepData as any).prerequisitesUk || null,
        contentMd: stepData.contentMd,
        expectedResult: stepData.expectedResult,
        expectedResultUk: (stepData as any).expectedResultUk || null,
        commonErrors: stepData.commonErrors,
        commonErrorsUk: (stepData as any).commonErrorsUk || null,
        order: stepData.order,
        status: "PUBLISHED",
        tags: ["remote", "ubuntu", "gcp"],
      },
      create: {
        moduleId: mod.id,
        title: stepData.title,
        titleUk: (stepData as any).titleUk || null,
        slug: stepData.slug,
        goal: stepData.goal,
        goalUk: (stepData as any).goalUk || null,
        prerequisites: stepData.prerequisites,
        prerequisitesUk: (stepData as any).prerequisitesUk || null,
        contentMd: stepData.contentMd,
        expectedResult: stepData.expectedResult,
        expectedResultUk: (stepData as any).expectedResultUk || null,
        commonErrors: stepData.commonErrors,
        commonErrorsUk: (stepData as any).commonErrorsUk || null,
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
