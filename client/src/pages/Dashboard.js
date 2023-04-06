import { Link, useNavigate } from "react-router-dom";

import "./Dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
        {!token &&
            <>
            <div>
                <Link to='/register'>Register</Link>
            </div>
            <div>
                <Link to='/login'>Login</Link>
            </div>
            </>
        }
        {token &&
            <>
            <div>
                <Link to='/profile'>Profile</Link>
            </div>
            <div>
                <Link onClick={handleLogout}>Logout</Link>
            </div>
            </>
        }
        <div>
            <Link to='/'>Home</Link>
        </div>
    </div>
  )
}

export default Dashboard