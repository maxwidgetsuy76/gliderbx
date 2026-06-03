import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [screen, setScreen] = useState('username')
  const [username, setUsername] = useState('')
  const [selectedServices, setSelectedServices] = useState(['s1'])
  const [chosenAmounts, setChosenAmounts] = useState({})
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState(['System initialized...'])
  const [counters, setCounters] = useState({ cnt1: 0, cnt2: 0, cnt3: 0, cnt4: 0 })
  const [offersList, setOffersList] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [sliderValues, setSliderValues] = useState({})
  const [onlineCount, setOnlineCount] = useState(234)
  
  const audioCtxRef = useRef(null)

  const SERVICES = [
    { key: 's1', name: 'Robux', icon: 'fas fa-coins', min: 500, max: 10000, step: 100, unit: 'R$' },
    { key: 's2', name: 'Premium', icon: 'fas fa-crown', min: 30, max: 365, step: 30, unit: 'days' },
    { key: 's3', name: 'Limiteds', icon: 'fas fa-gem', min: 5, max: 50, step: 5, unit: 'items' },
    { key: 's4', name: 'Game Passes', icon: 'fas fa-ticket', min: 1, max: 10, step: 1, unit: 'passes' }
  ]

  const stepsData = ['Recherche du compte', 'Connexion aux serveurs', 'Contournement de l\'anti-triche', 'Injection des ressources', 'Finalisation du transfert']
  const stepIcons = ['fa-search', 'fa-link', 'fa-shield-halved', 'fa-server', 'fa-flag-checkered']

  // Sound functions
  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      ctx.resume()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      if (type === 'click') {
        osc.frequency.value = 800
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05)
        osc.stop(ctx.currentTime + 0.05)
      } else if (type === 'success') {
        osc.frequency.value = 523
        gain.gain.value = 0.2
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15)
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'stepDone') {
        osc.frequency.value = 880
        gain.gain.value = 0.15
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.07)
        osc.stop(ctx.currentTime + 0.07)
      } else if (type === 'tick') {
        osc.frequency.value = 1000
        gain.gain.value = 0.08
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.03)
        osc.stop(ctx.currentTime + 0.03)
      } else if (type === 'coin') {
        osc.frequency.value = 1200
        gain.gain.value = 0.12
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08)
        osc.stop(ctx.currentTime + 0.08)
      }
    } catch(e) { console.log('Sound error:', e) }
  }

  // Online counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(234 + Math.floor(Math.random() * 100))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Toggle service
  const toggleService = (key) => {
    playSound('click')
    if (selectedServices.includes(key)) {
      setSelectedServices(selectedServices.filter(s => s !== key))
    } else {
      setSelectedServices([...selectedServices, key])
    }
  }

  // Start button - go to amount screen
  const handleStart = () => {
    if (username.length < 3 || selectedServices.length === 0) return
    playSound('click')
    setScreen('amount')
  }

  // Build sliders on amount screen
  useEffect(() => {
    if (screen === 'amount') {
      const initial = {}
      selectedServices.forEach(key => {
        const svc = SERVICES.find(s => s.key === key)
        if (svc) {
          const mid = Math.round((svc.min + svc.max) / 2 / svc.step) * svc.step
          initial[key] = mid
        }
      })
      setSliderValues(initial)
    }
  }, [screen, selectedServices])

  // Update slider value
  const updateSlider = (key, value) => {
    playSound('tick')
    setSliderValues(prev => ({ ...prev, [key]: parseInt(value) }))
  }

  // Continue from amount to loading
  const handleAmountContinue = () => {
    playSound('click')
    const amounts = {}
    selectedServices.forEach(key => {
      amounts[key] = sliderValues[key] || 0
    })
    setChosenAmounts(amounts)
    startLoading()
  }

  // Loading simulation
  const startLoading = () => {
    setScreen('loading')
    setProgress(0)
    setCurrentStep(0)
    setLogs(['System initialized...'])
    setCounters({ cnt1: 0, cnt2: 0, cnt3: 0, cnt4: 0 })
    
    let step = 0
    const totalSteps = stepsData.length
    
    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval)
        setTimeout(() => {
          playSound('success')
          setScreen('result')
        }, 500)
        return
      }
      
      setCurrentStep(step)
      const newProgress = Math.round((step + 1) / totalSteps * 100)
      setProgress(newProgress)
      
      setLogs(prev => [...prev, `→ ${stepsData[step]}...`, `${stepsData[step]} completed!`])
      
      // Update counters
      const newCounters = { ...counters }
      SERVICES.forEach((svc, idx) => {
        if (chosenAmounts[svc.key]) {
          const target = chosenAmounts[svc.key]
          const current = Math.min(target, Math.floor(target * (newProgress / 100)))
          newCounters[`cnt${idx + 1}`] = current
        }
      })
      setCounters(newCounters)
      
      playSound('stepDone')
      step++
    }, 1200)
  }

  // Load CPAGrip offers
  const loadOffers = () => {
    playSound('click')
    setLoadingOffers(true)
    setScreen('offers')
    
    const proxyUrl = 'https://watchmastersoftheuniverse.online/api/offers.php?source=cpagrip&user_id=72431&pubkey=75ecdc0e04fbf94a7f639bbd1a2b9f96'
    
    fetch(proxyUrl)
      .then(res => res.json())
      .then(data => {
        if (data.offers && data.offers.length) {
          const formatted = data.offers.map(offer => ({
            ...offer,
            offerlink: offer.offerlink.replace('www.cpagrip.com', 'motifiles.com')
          }))
          setOffersList(formatted)
          playSound('success')
        }
        setLoadingOffers(false)
      })
      .catch(() => {
        setLoadingOffers(false)
      })
  }

  // Get user avatar
  const [avatarUrl, setAvatarUrl] = useState(null)
  useEffect(() => {
    if (username && screen === 'loading') {
      fetch(`https://best-generators.com/api/roblox.php?action=avatar&u=${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(data => {
          if (data.url && data.url !== 'error') setAvatarUrl(data.url)
        })
        .catch(() => {})
    }
  }, [username, screen])

  return (
    <div className="app" onClick={() => audioCtxRef.current?.resume()}>
      {/* Animated Background */}
      <div className="bg-world">
        <div className="bg-gradient"></div>
        <div className="bg-dots"></div>
        <div className="floating-shapes">
          {[...Array(12)].map((_, i) => <div key={i} className={`shape shape-${i + 1}`}></div>)}
        </div>
      </div>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <svg viewBox="0 0 50 50" width="28" height="28">
              <path fill="#e2231a" d="M 12.125 1.9980469 A 1.0001 1.0001 0 0 0 11.199219 2.7441406 L 2.0332031 37.576172 A 1.0001 1.0001 0 0 0 2.7460938 38.798828 L 37.580078 47.966797 A 1.0001 1.0001 0 0 0 38.802734 47.253906 L 47.96875 12.419922 A 1.0001 1.0001 0 0 0 47.255859 11.197266 L 12.421875 2.03125 A 1.0001 1.0001 0 0 0 12.125 1.9980469 z M 21.5 19 L 31 21.5 L 28.5 31 L 19 28.5 L 21.5 19 z"/>
            </svg>
            TROBUX.COM
          </div>
          <div className="nav-stat"><i className="fas fa-circle"></i> {onlineCount} online</div>
        </div>
      </nav>

      {/* SCREEN 1: USERNAME */}
      {screen === 'username' && (
        <div className="container">
          <div className="hero">
            <div className="hero-icon">
              <svg width="60" height="60" viewBox="0 0 50 50">
                <path fill="#e2231a" d="M 12.125 1.9980469 A 1.0001 1.0001 0 0 0 11.199219 2.7441406 L 2.0332031 37.576172 A 1.0001 1.0001 0 0 0 2.7460938 38.798828 L 37.580078 47.966797 A 1.0001 1.0001 0 0 0 38.802734 47.253906 L 47.96875 12.419922 A 1.0001 1.0001 0 0 0 47.255859 11.197266 L 12.421875 2.03125 A 1.0001 1.0001 0 0 0 12.125 1.9980469 z M 21.5 19 L 31 21.5 L 28.5 31 L 19 28.5 L 21.5 19 z"/>
              </svg>
            </div>
            <h1>FREE ROBUX with TROBUX.COM</h1>
            <p>Get Robux, Premium and Limiteds on your Roblox account instantly.</p>
            <div className="hero-tags">
              <span className="tag"><i className="fas fa-circle-check"></i> Secure</span>
              <span className="tag"><i className="fas fa-bolt"></i> Instant</span>
              <span className="tag"><i className="fas fa-infinity"></i> Unlimited</span>
            </div>
          </div>
          
          <div className="card">
            <div className="card-bar"><i className="fas fa-user"></i> Enter your profile</div>
            <div className="card-content">
              <label className="field-label">Roblox Username</label>
              <div className="input-wrap">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Enter your username..." 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={() => playSound('tick')}
                />
              </div>
              <p className="input-hint">{username.length >= 3 ? '✓ Profile found' : 'Your Roblox username (without @)'}</p>
              
              <label className="field-label" style={{ marginTop: 18 }}>Select resources</label>
              <div className="svc-grid">
                {SERVICES.map(svc => (
                  <div 
                    key={svc.key} 
                    className={`svc-card ${selectedServices.includes(svc.key) ? 'selected' : ''}`} 
                    onClick={() => toggleService(svc.key)}
                  >
                    <div className={`svc-ico ${svc.key === 's1' ? 'c1' : svc.key === 's2' ? 'c2' : svc.key === 's3' ? 'c3' : 'c4'}`}>
                      <i className={svc.icon}></i>
                    </div>
                    <div className="svc-txt">
                      <strong>{svc.name}</strong>
                      <small>up to {svc.max.toLocaleString()} {svc.unit}</small>
                    </div>
                    <div className="svc-chk"><i className="fas fa-check"></i></div>
                  </div>
                ))}
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleStart} 
                disabled={username.length < 3 || selectedServices.length === 0}
              >
                <i className="fas fa-play"></i> Continue
              </button>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="testi">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=xX_DarkGamer42" className="testi-av" alt="avatar" />
            <div>
              <div><span className="testi-name">xX_DarkGamer42</span><span className="testi-stars">★★★★★</span></div>
              <p>omg I got 5000 robux in less than 1 hour, bought all blox fruit gamepasses!!</p>
            </div>
          </div>
          <div className="testi">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=BloxQueen_Lina" className="testi-av" alt="avatar" />
            <div>
              <div><span className="testi-name">BloxQueen_Lina</span><span className="testi-stars">★★★★★</span></div>
              <p>finally premium without asking my parents lol, my avatar looks so cool now</p>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1.5: AMOUNT SELECTION */}
      {screen === 'amount' && (
        <div className="container">
          <div className="card">
            <div className="card-bar"><i className="fas fa-coins"></i> How many Robux do you want?</div>
            <div className="card-content">
              {selectedServices.map(key => {
                const svc = SERVICES.find(s => s.key === key)
                if (!svc) return null
                const value = sliderValues[key] || svc.min
                const min = svc.min
                const max = svc.max
                const step = svc.step
                const percent = ((value - min) / (max - min)) * 100
                return (
                  <div key={key} className="slider-group">
                    <div className="slider-head">
                      <div className="slider-lbl">
                        <i className={svc.icon}></i>
                        <span>{svc.name}</span>
                      </div>
                      <div className="slider-val">{value.toLocaleString()} {svc.unit}</div>
                    </div>
                    <div className="slider-track">
                      <input 
                        type="range" 
                        className="gen-range" 
                        min={min} 
                        max={max} 
                        step={step} 
                        value={value} 
                        onChange={(e) => updateSlider(key, e.target.value)}
                      />
                      <div className="slider-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="slider-marks">
                      <span>{min.toLocaleString()}</span>
                      <span>{max.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
              <button className="slider-continue" onClick={handleAmountContinue}>
                <i className="fas fa-arrow-right"></i> Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: LOADING */}
      {screen === 'loading' && (
        <div className="container">
          <div className="card">
            <div className="card-bar"><i className="fas fa-cog fa-spin"></i> Generating...</div>
            <div className="card-content">
              <div className="user-profile">
                <div className="user-avatar">
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <i className="fas fa-user"></i>}
                </div>
                <div className="user-info">
                  <strong>{username || 'User'}</strong>
                  <small><i className="fas fa-circle-check"></i> Account verified</small>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span id="progressTitle">{stepsData[currentStep] || 'Complete!'}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              
              {stepsData.map((step, idx) => (
                <div key={idx} className={`step ${idx < currentStep ? 'done' : ''}`} style={{ opacity: idx <= currentStep ? 1 : 0.4 }}>
                  <div className="step-dot">
                    <i className={`fas ${idx < currentStep ? 'fa-check-circle' : idx === currentStep ? 'fa-spinner fa-spin' : stepIcons[idx]}`}></i>
                  </div>
                  <div>
                    <div className="step-title">{step}</div>
                    <div className="step-status">
                      {idx < currentStep ? 'Completed' : idx === currentStep ? 'Processing...' : 'Pending...'}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="terminal">
                <div className="term-bar">
                  <div className="term-dots"><span></span><span></span><span></span></div>
                  <span>Console</span>
                </div>
                <div className="term-body">
                  {logs.map((log, i) => (
                    <div key={i} className="log-line">
                      <span className="log-ts">[{String(Math.floor(i / 60)).padStart(2, '0')}:{String(i % 60).padStart(2, '0')}]</span>
                      <span className="log-success">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="counters">
                {SERVICES.map((svc, idx) => (
                  <div key={idx} className="cnt">
                    <i className={svc.icon}></i>
                    <span className="cnt-val">{counters[`cnt${idx + 1}`]?.toLocaleString() || 0}</span>
                    <span className="cnt-lbl">{svc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: RESULT */}
      {screen === 'result' && (
        <div className="container">
          <div className="card">
            <div className="card-bar" style={{ background: 'rgba(0,176,111,0.1)' }}>
              <i className="fas fa-circle-check" style={{ color: '#00b06f' }}></i> Complete!
            </div>
            <div className="card-content" style={{ textAlign: 'center' }}>
              <p>Your resources are ready. Complete verification to receive them.</p>
              <div className="result-grid">
                {SERVICES.map((svc, idx) => (
                  <div key={idx} className="result-box">
                    <i className={svc.icon}></i>
                    <span className="result-val">+{counters[`cnt${idx + 1}`]?.toLocaleString() || 0}</span>
                    <span className="result-lbl">{svc.name}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-verify" onClick={loadOffers}>
                <i className="fas fa-shield-halved"></i> Verify my account
              </button>
              <p className="verify-note"><i className="fas fa-lock"></i> Complete 2 offers to unlock your resources.</p>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 4: OFFERS */}
      {screen === 'offers' && (
        <div className="container">
          <div className="card">
            <div className="card-bar"><i className="fas fa-shield-halved"></i> Human verification</div>
            <div className="card-content">
              <p style={{ marginBottom: 14 }}>Complete 2 offers to unlock your resources.</p>
              
              {loadingOffers ? (
                <>
                  <div className="spinner"></div>
                  <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading offers...</p>
                </>
              ) : offersList.length > 0 ? (
                <div className="offers-list">
                  {offersList.map((offer, idx) => (
                    <a key={idx} href={offer.offerlink} target="_blank" className="offer-card" rel="noopener noreferrer">
                      <div className="offer-icon">
                        {offer.offerphoto ? <img src={offer.offerphoto} width="48" height="48" style={{ borderRadius: 10 }} alt="offer" /> : <i className="fas fa-gift"></i>}
                      </div>
                      <div className="offer-info">
                        <div className="offer-name">{offer.title}</div>
                        <div className="offer-desc">{offer.description || 'Complete this offer to unlock your rewards'}</div>
                      </div>
                      <div className="offer-go"><i className="fas fa-arrow-right"></i></div>
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#e2231a' }}>No offers available. Please try again later.</p>
              )}
              
              <div className="offers-foot"><i className="fas fa-info-circle"></i> Your resources will be credited within 5-10 minutes.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App