import HELP from './help'

const app = Application.currentApplication();
app.includeStandardAdditions = true;

const buttons = ['Previous', 'Continue']

const steps = {
  folder: () => app.chooseFolder({
    withPrompt: "Please select destination folder to download :",
    multipleSelectionsAllowed: false,
  }),
  cmd: () => app.displayDialog(HELP, {
    defaultAnswer: 'anethamusic -n 3',
    withIcon: 'note',
    buttons,
    defaultButton: 'Continue'
  })
}

const validateDialog = (dialog) => dialog?.buttonReturned || null
  ? dialog.buttonReturned === buttons[1]
  : dialog != null

function process() {
  let current = 0
  const stepsCallbacks = Object.values(steps)
  const stepRes = []

  while (current < stepsCallbacks.length) {
    if (current < 0) break

    const dialog = stepsCallbacks[current]()

    if (!validateDialog(dialog)) {
      current--

      continue
    }

    stepRes.push(dialog?.textReturned || dialog)
    current++
  }

  return stepRes
}

/**
 * run on App start
 *
 * @param {[]} _ Cli arguments
 */
export function run(_) {
  const processed = process()

  if (!processed) {
    app.displayDialog("Stopped", { buttons: ["Confirm"] })
    return 'Stopped'
  };

  const [folder, cmd] = processed;

  main({ folder, cmd });
}

const main = ({ folder, cmd }) => {
  const node = '/usr/local/bin/node'
  app.doShellScript(
    'curl -fSsL https://raw.githubusercontent.com/loic-roux-404/sound-dl/master/install.sh | bash',
    { administratorPrivileges: app.doShellScript(`ls ${node}`) !== node }
  )
  const finalDest = `SC_DEST="\/${String(folder).replaceAll('/', '\/')}"`
  const exe = '~/.sound-dl/src/sc'
  let res

  try {
    res = app.doShellScript(`${finalDest} ${node} ${exe} ${cmd}`)
  } catch(e) {
    res = `Possible error : ${String(e)} \nLog : ${res}`
  }

  app.displayDialog(
    `Download done, check all your song are in ${folder}\n${res}`,
    { buttons: ["Confirm"] }
  )
};
