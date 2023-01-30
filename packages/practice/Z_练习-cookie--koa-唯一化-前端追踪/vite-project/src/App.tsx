import './App.css'
function App() {
  return (
    <div className="App">
      <div className="card">
        <button id='getLocalCookie'>
          getLocalCookie
        </button>
        
        <button id='setLocalCookie'>
          setLocalCookie
        </button>

        <h2 id='cookieDomText_Key'></h2>
        
        <h2 id='cookieDomText_Value'></h2>
        
        <h2 id='step'></h2>
      </div>
    </div>
  )
}

export default App
