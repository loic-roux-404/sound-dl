const SoundCloud = require('soundcloud-scraper')
const fs = require('fs')
const path = require('path')

const client = new SoundCloud.Client()
const TRACKS = 'tracks' // default
const LIKES = 'likes'
const simplifiedSong = ({ url, title }) => ({ url, title })

const getSongsInUser = async (username, field = TRACKS) => {
    return (await client.getUser(username))[field]
        .map(simplifiedSong)
}

const getSongsInPlaylist = async (url) => {
    return (await client.getPlaylist(url))[TRACKS]
        .map(simplifiedSong)
}

const downloadSongs = (folder, songsUrl, count = null) => {
    if (count) songsUrl = songsUrl.slice(0, count)

    songsUrl.every(({ title, url }) => client.getSongInfo(url)
        .then(async song => {
            const songDir = `${folder}/${song.author.name || song.author.username}`
                .replace(' ', '-')

            if (!fs.existsSync(`${songDir}/${title}.mp3`)) {
                if (!fs.existsSync(songDir)) {
                    fs.mkdirSync(songDir, { recursive: true })
                }

                const stream = await song.downloadProgressive();
                const writer = stream.pipe(
                    fs.createWriteStream(`${songDir}/${title}.mp3`));
                    writer.on("finish", () => {
                        console.log("Finished writing song!")
                        process.exit(1);
                });
            }
        })
        .catch(console.error)
    );
}

const downloadUserSongs = async ({ folder, username, field, count }) =>
    downloadSongs(folder, await getSongsInUser(username, field), count)

const downloadPlaylistSongs = async ({ folder, url, count }) =>
    downloadSongs(folder, await getSongsInPlaylist(url,), count)

const tracks = cnf => downloadUserSongs(cnf)

const likes = cnf => downloadUserSongs({ ...cnf, ...{ field: LIKES } })

const playlists = cnf => downloadPlaylistSongs(cnf)

function main(args) {
    const folder = path.resolve(process.env.SC_DEST)

    if (!folder || args.length <= 0 ) {
        return console.info('Bad usage check documentation https://github.com/loic-roux-404/sound-dl')
    }

    let tracksEnabled = true
    let likesEnabled = false
    let playlistsEnabled = false
    let subject = null
    let count = null

    let i = -1
    for (const arg of args) {
        i++

        if (!arg.includes('-')) {
            subject = subject || arg
            if (subject.includes('http')) {
                playlistsEnabled = true
                tracksEnabled = false
            }
            continue
        }

        if (arg === '-n') {
            count = (i + 1) in args ? args[i + 1] : null
            continue
        }

        if ((i - 1) in args ? args[i - 1] : null === '-n') {
            continue
        }

        if (likesEnabled || playlistsEnabled) {
            continue
        }

        if (arg === '-l') {
            likesEnabled = true
            tracksEnabled = false
        }
    }

    console.info(`Downloading in ${folder} :
${likesEnabled ? 'likes enabled': ''}\
${tracksEnabled ? 'tracks of': ''}\
${playlistsEnabled ? 'playlist': ''}\
 ${subject} with limit of ${count} tracks
    `)

    if (tracksEnabled) tracks({ folder, username: subject, count })
    if (likesEnabled) likes({ folder, username: subject, count })
    if (playlistsEnabled) playlists({ folder, url: subject, count })

    return 0
}

main(process.argv.slice(2))
