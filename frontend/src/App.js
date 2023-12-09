import './App.css'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import UserDashboard from './components/Dashboard/UserDashboard'


function App() {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route exact path="/" component={SignUp} />
          <Route exact path="/SignIn" component={SignIn} />
          <Route exact path="/AdminDashboard" component={AdminDashboard} />
          <Route exact path="/UserDashboard"   component={UserDashboard} />
        
        </Switch>
      </Router>
    </div>
  )
}

export default App
