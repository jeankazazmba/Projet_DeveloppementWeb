import { spawn } from 'node:child_process'

const url = 'http://127.0.0.1:5173/desktop.html'

try {
  const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
  const html = await response.text()
  if (!response.ok || !html.includes('Mon Miam Miam · Bureau')) {
    throw new Error('Le port 5173 est occupé par un autre site.')
  }
  console.log('Tauri réutilise le serveur web déjà actif sur le port 5173.')
} catch (error) {
  if (error.message.includes('occupé')) {
    console.error(error.message)
    process.exitCode = 1
  } else {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    const child = spawn(npm, ['run', 'dev', '--', '--host', '127.0.0.1'], { stdio: 'inherit', shell: process.platform === 'win32' })
    child.on('exit', code => { process.exitCode = code || 0 })
  }
}
