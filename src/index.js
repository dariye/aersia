/**
 * TODO:
 * primary
 * 1. offline
 * 2. performant - service workers
 *
 *
 *  secondary
 * 1. active listeners with pusher
 * 2. number of likes with pusher
 * 3. number of shares
 */

import 'babel-polyfill'
const URL = 'https://vip.aersia.net/roster.xml'

const PLAYLISTS = {
  'vip': 'https://vip.aersia.net/roster.xml',
  'mellow': 'https://vip.aersia.net/roster.xml',
  'source': 'vip.aersia.net/roster-source.xml',
  'exiled': 'vip.aersia.net/roster-exiled.xml',
  'wap': 'wap.aersia.net/roster.xml',
  'cpp': 'cpp.aersia.net/roster.xml'
}

let player = undefined
let deferredA2HS = undefined



async function main () {

  try {
    const { trackList: { track } } = await playlist()

    if (!player) player = new Player()

    renderTracklistView(track.slice(5), 'tracklist')

    const firstTrack = document.querySelector('.track article')
    if (firstTrack) player.load(firstTrack)

    const search = document.querySelector('#search')
    search.addEventListener('keyup', filter)

    const connectionIndicatorBtn = document.querySelector('.connection-indicator button')
    connectionIndicatorBtn.addEventListener('click', () => {
      const indicator = document.querySelector('.indicator')
      indicator.classList.add('hide')
    })
    //offline indicator
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)
    window.addEventListener('beforeinstallprompt', evt => {
      evt.preventDefault()
      if (!deferredA2HS) deferredA2HS = evt
      // TODO: Add button handler https://developers.google.com/web/fundamentals/app-install-banners/?hl=en
    })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  } catch(err) {
    console.log(err)
  }
}

class Tracklist {
  constructor(tracklist = []) {
    this.tracklist = new Set(tracklist)
  }
}

class Player {
  constructor() {
    this.currentTrack = null

    this.media = document.querySelector('audio')
    this.playBtn = document.querySelector('.play')
    this.pauseBtn = document.querySelector('.pause')
    this.stopBtn = document.querySelector('.stop')
    this.progressRange = document.querySelector('.progress')
    this.volumeRange = document.querySelector('.volume')
    this.elasped = document.querySelector('.elasped')
    this.nextBtn = document.querySelector('.next')
    this.previousBtn = document.querySelector('.previous')
    this.muteBtn = document.querySelector('.mute')
    this.unmuteBtn = document.querySelector('.unmute')
    this.replayBtn = document.querySelector('.replay')
    this.track = document.querySelector('.current-track')

    /**
     * Set initial player state
     */
    this.media.controls = false
    this.media.volume = parseInt(this.volumeRange.value) || 0.4
    this.media.muted = false

    /**
     * Register event listeners
     */
    this.playBtn.addEventListener('click', this.togglePlayback)
    this.pauseBtn.addEventListener('click', this.togglePlayback)
    this.stopBtn.addEventListener('click', this.stop)
    this.muteBtn.addEventListener('click', this.toggleMute)
    this.unmuteBtn.addEventListener('click', this.toggleMute)
    this.replayBtn.addEventListener('click', this.replay)
    this.nextBtn.addEventListener('click', this.nextTrack)
    this.previousBtn.addEventListener('click', this.previousTrack)

    this.volumeRange.addEventListener('input', this.setVolume)
    this.progressRange.addEventListener('input', this.seek)

    this.media.addEventListener('timeupdate', this.trackProgress)
    this.media.addEventListener('ended', this.nextTrack)
  }

  togglePlayback = (evt) => {
    if (this.media.paused || this.media.ended) {
      this.pauseBtn.classList.toggle('hide')
      this.playBtn.classList.toggle('hide')
      this.media.play()
    // TODO:
    // - on play, scroll to next up
    } else {
      this.pauseBtn.classList.toggle('hide')
      this.playBtn.classList.toggle('hide')
      this.media.pause()
    }
  }

  toggleMute = () => {
    this.media.muted = !this.media.muted
    this.muteBtn.classList.toggle('hide')
    this.unmuteBtn.classList.toggle('hide')
  }

  stop = () => {
    this.media.pause()
    this.reset()
    this.playBtn.classList.remove('hide')
    this.pauseBtn.classList.add('hide')
  }

  setVolume = () => {
    this.media.volume = this.volumeRange.value
  }

  seek = () => {
    this.media.currentTime = this.media.duration * (this.progressRange.value/100)
  }

  reset = () => {
    this.media.currentTime = 0
    this.progressRange.value = 0
  }

  replay = () => {
    this.reset()
    this.media.play()
    this.playBtn.classList.add('hide')
    this.pauseBtn.classList.remove('hide')
  }

  trackProgress = () => {
    const currentTime = this.media.currentTime
    const duration = this.media.duration
    this.progressRange.value = !duration || duration === 0
      ? 0
      : Math.floor((100/duration) * currentTime)

    let time = currentTime
    // this.elasped.textContent = `${((time-(time%=60))/60+(9<time?':':'0')+time)}`
  }

  load = (ctx) => {
    const id = ctx.getAttribute('data-track-id')
    const uri = ctx.getAttribute('data-track-uri')
    const title = ctx.getAttribute('data-track-title')
    const creator = ctx.getAttribute('data-track-creator')
    this.currentTrack = { id, uri, title, creator }

    this.reset()
    this.media.src = this.currentTrack.uri
    this.media.load()
    this.togglePlayback()

    this.track.innerHTML = `<h3>${this.currentTrack.creator} - ${this.currentTrack.title}</h3>`
    this.track.setAttribute('data-track-id', this.currentTrack.id)
    this.track.setAttribute('data-track-uri', this.currentTrack.uri)
    this.track.setAttribute('data-track-title', this.currentTrack.title)
    this.track.setAttribute('data-track-creator', this.currentTrack.creator)
  }

  nextTrack = () => {
    const id = parseInt(this.currentTrack.id)
    const track = document.querySelectorAll('.track article')
    if (id === track.length -1) {
      this.stop()
    } else {
      this.load(track[id+1])
    }
  }

  previousTrack = () => {
    const id = parseInt(this.currentTrack.id)
    const track = document.querySelectorAll('.track article')
    if (id === 0) {
      this.stop()
    } else {
      this.load(track[id-1])
    }
  }
}

function renderTracklistView (tracks, elementId) {
  const container = document.getElementById(elementId)
  const tracklist = document.createElement('ul')
  tracklist.classList.add('nes-list', 'is-disc', 'tracks')

  tracks.forEach((track, idx) => tracklist.appendChild(createTrackView(idx, track)))

  container.appendChild(tracklist)
}

function createTrackView (id, { creator, location, title }) {
  const track = document.createElement('li')
  track.classList.add('track')

  const trackContent = document.createElement('article')
  trackContent.setAttribute('data-track-id', id)
  trackContent.setAttribute('data-track-uri', location['#text'])
  trackContent.setAttribute('data-track-title', title['#text'])
  trackContent.setAttribute('data-track-creator', creator['#text'])

  const trackTitle = document.createElement('h3')
  trackTitle.innerHTML = `${creator['#text']} - ${title['#text']}`

  trackContent.appendChild(trackTitle)
  track.appendChild(trackContent)

  trackContent['onclick'] = function (evt) { player.load(this) }

  return track
}

async function fetchPlaylist () {
  const tracklist = await fetch(URL, {
  })
  return await tracklist.text()
}

function parseXML (text) {
  const parser = new DOMParser()
  return parser.parseFromString(text, 'text/xml')
}

function xmlToJson (xml) {
  let obj = Object.create(null)

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i)
      const nodeName = item.nodeName;

      if (typeof obj[nodeName] === 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof obj[nodeName].push === 'undefined') {
          const old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }

        obj[nodeName].push(xmlToJson(item))
      }
    }
  }

  return obj
}

async function playlist () {
 return xmlToJson(parseXML(await fetchPlaylist())).playlist
}

function  filter() {
  const query = document.querySelector('#search').value.toLowerCase()
  const tracks = document.querySelector('.tracks')
  const track = document.querySelectorAll('.track')

  for (let i = 0; i < track.length; i++) {
    const trackTitle = track[i].getElementsByTagName('h3')[0]
    const titleText = trackTitle.textContent || trackTitle.innerText

    if (titleText.toLowerCase().indexOf(query) > -1) {
      track[i].style.display = ''
    } else {
      track[i].style.display = 'none'
    }
  }
}

function handleNetworkChange (evt) {
  const indicator = document.querySelector('.indicator')
  if (navigator.onLine) {
    indicator.classList.add('hide')
  } else {
    indicator.classList.remove('hide')
  }
}

window.onload = main
