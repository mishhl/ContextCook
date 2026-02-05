import profilePicture from '../../public/ProfilePicture.png'
import editIcon from '../../public/EditIcon.png'

export default function Profile() {
    return (
        <>
            <p style={{fontSize: "36px", fontWeight: "bold", color: "#1E1E1E", margin: "32px"}}>Welcome, Jane Doe</p>
            <div style={{justifySelf: "center", width: "25%", height: "400px", backgroundColor: "#F5F5F5"}}>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <img src={profilePicture} style={{width: "24px", height: "24px", margin: "18px"}}/>
                    <div style={{color: "#1E1E1E", fontSize: "12PX", margin: "18px auto", textAlign: "center"}}>
                        <p style={{fontWeight: "bold"}}>Jane Doe</p>
                        <p>janedoe@gmail.com</p>
                    </div>
                </div>
                <div>
                    <div style={{margin: "0px 18px 0px 18px", fontSize: "12px", display: "flex", justifyContent: "space-between"}}>
                        <p style={{color: "#1E1E1E"}}>Kitchen Equipment</p>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <p style={{color: "#B3B3B3", marginRight: "5px"}}>Edit</p>
                            <img style={{height: "12px", width: "12px", alignSelf: "center"}} src={editIcon}/>
                        </div>
                    </div>
                    <div style={{backgroundColor: "#D9D9D9", height: "50px", margin: "4px 18px 10px 18px"}}></div>
                </div>
                <div>
                    <p style={{color: "#1E1E1E", fontSize: "12px", margin: "0px 18px 0px 18px"}}>Dietary Restrictions</p>
                    <div style={{backgroundColor: "#D9D9D9", height: "50px", margin: "4px 18px 10px 18px"}}></div>
                </div>
                <div>
                    <p style={{color: "#1E1E1E", fontSize: "12px", margin: "0px 18px 0px 18px"}}>Calendar</p>
                    <div style={{backgroundColor: "#D9D9D9", height: "50px", margin: "4px 18px 10px 18px"}}></div>
                </div>
                <div>
                    <p style={{color: "#1E1E1E", fontSize: "12px", margin: "0px 18px 0px 18px"}}>Nutritional Goal</p>
                    <div style={{backgroundColor: "#D9D9D9", height: "50px", margin: "4px 18px 10px 18px"}}></div>
                </div>
            </div>
        </>
    )
}