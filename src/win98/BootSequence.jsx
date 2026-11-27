import { useEffect, useRef, useState } from 'react'
import './boot.css'

const assets = import.meta.env.BASE_URL + 'win98-system/'
const tableStart = 5100
const pciStart = tableStart + 500
const verifyingStart = pciStart + 1500
const dosStart = verifyingStart + 1860
const splashStart = dosStart + 1200
const bootEnd = splashStart + 4000
const memoryTotal = 524288

const drives = [
  'Primary Master   : ST380011A 3.06',
  'Primary Slave    : None',
  'Secondary Master : LITE-ON LTR-52246S 6S0F',
  'Secondary Slave  : None',
]

const hardware = [
  ' CPU Type        : AMD Athlon(tm) XP 2500+   Base Memory      :    640K',
  ' CPU ID/ucode ID : 06A0/0000                 Extended Memory  : 523264K',
  ' CPU Clock       : 1833MHz                   Cache Memory     :    512K',
  null,
  ' Diskette Drive A : 1.44M, 3.5 in.           Display Type     : EGA/VGA',
  ' Diskette Drive B : None                     Serial Port(s)   : 3F8 2F8',
  ' Pri. Master Disk : LBA,ATA 100, 80GB         Parallel Port(s) : 378',
  ' Pri. Slave  Disk : None                     DDR at Bank(s)   : 0 1',
  ' Sec. Master Disk : CDROM,Mode 4',
  ' Sec. Slave  Disk : None',
]

const pciDevices = [
  '   0        1        1      10DE   0064   0C05  SMBus Controller            11',
  '   0        2        0      10DE   0067   0C03  USB 1.0/1.1 OHCI Cntrlr     11',
  '   0        2        2      10DE   0068   0C03  USB 2.0 EHCI Cntrlr         5',
  '   0        6        0      10DE   006A   0401  Multimedia Device           5',
  '   0        9        0      10DE   0065   0101  IDE Cntrlr                  14',
  '   1        5        0      10EC   8139   0200  Network Cntrlr              10',
  '   3        0        0      10DE   0322   0300  Display Cntrlr              11',
  '                                                ACPI Controller             9',
]

const rule = '─'.repeat(78)
const hardwareTable = [
  '┌' + rule + '┐',
  ...hardware.map(row => row === null ? '├' + rule + '┤' : '│' + row.padEnd(78) + '│'),
  '└' + rule + '┘',
]

function postRows(elapsed) {
  const rows = Array(25).fill('')
  rows[0] = '   Phoenix - AwardBIOS v6.00PG, An Energy Star Ally'
  rows[1] = '   Copyright (C) 1984-2000, Phoenix Technologies, LTD'
  rows[3] = 'ASUS A7V ACPI BIOS Rev 1007'
  if (elapsed >= 300) rows[5] = 'Main Processor : AMD Athlon(tm) Thunderbird 1000 (133x7.5)'
  if (elapsed >= 600) {
    const memory = Math.min(memoryTotal, Math.floor((elapsed - 600) * 512 / 1600) * 1024)
    rows[6] = 'Memory Testing : ' + String(memory).padStart(7) + 'K' + (memory === memoryTotal ? ' OK' : '')
  }
  if (elapsed >= 2400) rows[8] = 'Memory Frequency For PC133 SDRAM'
  drives.forEach((drive, index) => {
    if (elapsed >= 2600 + index * 450) rows[9 + index] = drive
  })
  rows[23] = <>Press <strong>DEL</strong> to enter SETUP</>
  rows[24] = '01/01/2000-VIA-KT133-A7V'
  return rows
}

function tableRows(elapsed) {
  const rows = [...hardwareTable]
  if (elapsed >= pciStart) {
    rows.push('PCI device listing.....',
      'Bus No. Device No. Func No. Vendor/Device Class Device Class               IRQ',
      rule + '──',
      ...pciDevices.slice(0, Math.floor((elapsed - pciStart) / 150) + 1))
  }
  if (elapsed >= verifyingStart) {
    rows.push('Verifying DMI Pool Data ' + '.'.repeat(Math.min(8, Math.floor((elapsed - verifyingStart) / 120))))
  }
  return rows
}

export default function BootSequence({ onComplete }) {
  const [elapsed, setElapsed] = useState(0)
  const completion = useRef(onComplete)
  const finished = useRef(false)

  useEffect(() => {
    completion.current = onComplete
  }, [onComplete])

  function finish() {
    if (finished.current) return
    finished.current = true
    completion.current()
  }

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const splash = new Image()
    splash.src = assets + 'logo.webp'

    const start = performance.now()
    const timer = window.setInterval(() => {
      if (finished.current) return
      if (motion.matches || performance.now() - start >= bootEnd) {
        finish()
      } else {
        setElapsed(performance.now() - start)
      }
    }, 50)
    const skipWithEscape = event => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      finish()
    }
    window.addEventListener('keydown', skipWithEscape)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('keydown', skipWithEscape)
    }
  }, [])

  const showPost = elapsed < tableStart

  return (
    <section className="win98-boot" aria-label="Starting Windows 98">
      {elapsed < dosStart ? (
        <div className="win98-boot-console" aria-hidden="true">
          {showPost && <>
            <img className="win98-boot-award" src={assets + 'award.png'} alt="" />
            <img className="win98-boot-energy" src={assets + 'energy.png'} alt="" />
          </>}
          {(showPost ? postRows(elapsed) : tableRows(elapsed)).map((row, index) => (
            <div className="win98-boot-row" key={index}>{row}</div>
          ))}
        </div>
      ) : elapsed < splashStart ? (
        <div className="win98-boot-dos" aria-hidden="true">Starting Windows 98...</div>
      ) : (
        <div className="win98-boot-splash" aria-hidden="true">
          <div className="win98-boot-splash-bar" />
        </div>
      )}
      <button className="win98-boot-skip" type="button" onClick={finish}>Skip boot</button>
    </section>
  )
}
