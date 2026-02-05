import { Outlet, Link } from 'react-router-dom';
import './MainLayout.css'
import profilePicture from '../../public/ProfilePicture.png'
import contextCookLogo from '../../public/ContextCookLogo.png'

function TabBox({ children }) {
    return (
        <div className="tabBox">
            {children}
        </div>
    )
}

export default function MainLayout() {
  return (
    <>
        <nav className="mainNavBar"> 
            <img src={contextCookLogo} style={{width: "24px", height: "24px", marginLeft: "32px"}}/>
            <div style={{display: "flex", justifyContent: "center"}}>
                <TabBox><Link to="/">Home</Link></TabBox>
                <TabBox><Link to="/profile">Profile</Link></TabBox>
                <TabBox><Link to="/recipes">Recipes</Link></TabBox>
                <TabBox><Link to="/recommendations">Recommendations</Link></TabBox>
            </div>
            <img src={profilePicture} style={{width: "24px", height: "24px", marginRight: "32px"}}/>
        </nav>
        <main className="mainBody">
            {/* The current page component renders here */}
            <Outlet /> 
        </main>
    </>
  );
}