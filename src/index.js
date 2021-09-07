import sc from './soundscrape'

const app = Application.currentApplication();
app.includeStandardAdditions = true;

const HELP = `
Soundcloud / bandcamp downloader :

Help: 
- Download Artist by just using artist name ("-n 3" limit download to 3 tracks)
    example : anethamusic -n 3

- For Tracks or Sets use url
    example : https://soundcloud.com/anethamusic/05h33-adagio-piano-sonata-no-14-moonlight-beethoven-remixed

- For Likes use /likes url of your username : https://soundcloud.com/loicrx69/likes

- Bandcamp type url with "-b" : https://mamatoldya.bandcamp.com/ -b

Write your command in the dialog below:`

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

  if (!process) { 
    app.displayDialog("Stopped", { buttons: ["ok"] })
    return 'Stopped'
  };

  const [folder, cmd] = processed;

  main({ folder, cmd });
}

const main = ({ folder, cmd }) => {
  sc({ folder, cmd })
};

// drag & drop as AppleScript App saved
export function openDocuments(docs) {
  main(docs);
}
