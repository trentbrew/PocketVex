import fs from 'node:fs/promises'
import path from 'node:path'
import chalk from 'chalk'
import inquirer from 'inquirer'

type Framework = 'react' | 'sveltekit' | 'nuxt' | 'other'

function resolveTargetDir(cwd: string) {
  const src = path.join(cwd, 'src')
  return fs
    .stat(src)
    .then(() => src)
    .catch(() => cwd)
}

function ensureDir(dir: string) {
  return fs.mkdir(dir, { recursive: true })
}

async function writeIfMissing(filePath: string, contents: string) {
  try {
    await fs.stat(filePath)
    return { created: false }
  } catch {
    await ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, contents, 'utf8')
    return { created: true }
  }
}

function recordsTs() {
  return `import type PocketBase from 'pocketbase'

export type ListParams = {
  page?: number
  perPage?: number
  filter?: string
  sort?: string
  expand?: string | string[]
}

export async function listRecords<T = any>(
  pb: PocketBase,
  collection: string,
  { page = 1, perPage = 50, ...rest }: ListParams = {}
) {
  return pb.collection(collection).getList<T>(page, perPage, rest as any)
}

export function subscribeToRecords<T = any>(
  pb: PocketBase,
  collection: string,
  topic: string | '*' = '*',
  handler: (e: { action: 'create' | 'update' | 'delete'; record: T }) => void
) {
  return pb.collection(collection).subscribe(topic as any, handler as any)
}

export async function getRecord<T = any>(pb: PocketBase, collection: string, id: string, opts?: any) {
  return pb.collection(collection).getOne<T>(id, opts)
}

export async function createRecord<T = any>(pb: PocketBase, collection: string, data: Partial<T>) {
  return pb.collection(collection).create<T>(data as any)
}

export async function updateRecord<T = any>(pb: PocketBase, collection: string, id: string, data: Partial<T>) {
  return pb.collection(collection).update<T>(id, data as any)
}

export async function deleteRecord(pb: PocketBase, collection: string, id: string) {
  return pb.collection(collection).delete(id)
}
`
}

function authTs() {
  return `import type PocketBase from 'pocketbase'

export async function loginWithPassword(pb: PocketBase, email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password)
}

export function logout(pb: PocketBase) {
  pb.authStore.clear()
}

export function getCurrentUser<T = any>(pb: PocketBase) {
  return pb.authStore.model as T | null
}

export function isAuthed(pb: PocketBase) {
  return !!pb.authStore.token && !!pb.authStore.model
}

export async function refresh(pb: PocketBase) {
  if (!pb.authStore.isValid) return
  return pb.collection('users').authRefresh()
}
`
}

function indexTs() {
  return `export * from './records'
export * from './auth'
`
}

function reactClientTs(envVar: string) {
  return `import PocketBase from 'pocketbase'

export const PB_URL = process.env.${envVar} || 'http://127.0.0.1:8090'
export const pb = new PocketBase(PB_URL)
`
}

function svelteClientTs(envVar: string) {
  return `import PocketBase from 'pocketbase'

const url = (import.meta as any).env?.${envVar} || 'http://127.0.0.1:8090'
export const pb = new PocketBase(url)
`
}

function nuxtPluginTs() {
  return `import PocketBase from 'pocketbase'
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const pb = new PocketBase(config.public.pbUrl)
  nuxtApp.provide('pb', pb)
})

declare module '#app' { interface NuxtApp { $pb: import('pocketbase').default } }
declare module 'vue' { interface ComponentCustomProperties { $pb: import('pocketbase').default } }
`
}

async function updatePackageJson(cwd: string, outRel: string) {
  const pkgPath = path.join(cwd, 'package.json')
  try {
    const raw = await fs.readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw)
    pkg.scripts = pkg.scripts || {}
    if (!pkg.scripts['pv:types']) {
      pkg.scripts['pv:types'] = `pocketvex types generate --output ${outRel} || echo 'PocketVex CLI not found; skipping types'`
    }
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

export async function runInit(frameworkFlag?: Framework) {
  const cwd = process.cwd()
  const targetBase = await resolveTargetDir(cwd)

  let framework: Framework = frameworkFlag || 'other'
  if (!frameworkFlag) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework are you using?',
        choices: [
          { name: 'React (Next.js)', value: 'react' },
          { name: 'SvelteKit', value: 'sveltekit' },
          { name: 'Nuxt (Vue)', value: 'nuxt' },
          { name: 'Other / Generic', value: 'other' },
        ],
      },
    ])
    framework = answers.framework
  }

  const dir = path.join(targetBase, 'pocketvex')
  await ensureDir(dir)

  const writes = [] as { file: string; created: boolean }[]

  // Core modules
  writes.push({ file: path.join(dir, 'records.ts'), created: (await writeIfMissing(path.join(dir, 'records.ts'), recordsTs())).created })
  writes.push({ file: path.join(dir, 'auth.ts'), created: (await writeIfMissing(path.join(dir, 'auth.ts'), authTs())).created })
  writes.push({ file: path.join(dir, 'index.ts'), created: (await writeIfMissing(path.join(dir, 'index.ts'), indexTs())).created })

  // Client per framework
  if (framework === 'react') {
    const clientPath = path.join(dir, 'client.ts')
    writes.push({ file: clientPath, created: (await writeIfMissing(clientPath, reactClientTs('NEXT_PUBLIC_PB_URL'))).created })
  } else if (framework === 'sveltekit') {
    const clientPath = path.join(dir, 'client.ts')
    writes.push({ file: clientPath, created: (await writeIfMissing(clientPath, svelteClientTs('VITE_PB_URL'))).created })
  } else if (framework === 'nuxt') {
    const pluginsDir = path.join(cwd, 'plugins')
    await ensureDir(pluginsDir)
    const pluginPath = path.join(pluginsDir, 'pb.client.ts')
    writes.push({ file: pluginPath, created: (await writeIfMissing(pluginPath, nuxtPluginTs())).created })
  }

  const outRel = path.relative(cwd, path.join(dir, 'pb-types.d.ts'))
  const pkgUpdated = await updatePackageJson(cwd, outRel)

  // Report
  console.log(chalk.blue('\n📦 PocketVex client scaffold'))
  writes.forEach((w) => {
    console.log((w.created ? chalk.green('  + ') : chalk.gray('  = ')) + path.relative(cwd, w.file))
  })
  if (pkgUpdated) {
    console.log(chalk.gray(`  • Added script: pv:types → ${outRel}`))
  } else {
    console.log(chalk.yellow('  • Could not update package.json (missing?). Add a pv:types script manually.'))
  }

  console.log('\n' + chalk.white('Next steps:'))
  if (framework === 'react') {
    console.log(chalk.gray('  1) Set NEXT_PUBLIC_PB_URL in your env'))
    console.log(chalk.gray('  2) Import from pocketvex/: records/auth/client'))
  } else if (framework === 'sveltekit') {
    console.log(chalk.gray('  1) Set VITE_PB_URL in your .env'))
    console.log(chalk.gray('  2) Import from pocketvex/: records/auth/client'))
  } else if (framework === 'nuxt') {
    console.log(chalk.gray('  1) Set NUXT_PUBLIC_PB_URL or runtimeConfig.public.pbUrl'))
    console.log(chalk.gray('  2) Use injected $pb from plugins/pb.client.ts'))
  } else {
    console.log(chalk.gray('  1) Create a PocketBase client and pass it to records.ts helpers'))
  }

  console.log('\n' + chalk.green('Done!'))
}

