import { useNavigate } from 'react-router-dom';
import back from '../images/back.svg'
function BackHome() {
    const navigate = useNavigate();
    return (
        <>
            <div className="px-[25px] text-start bg-[#000] w-full">
                <img className="cursor-pointer" src={back} alt="Back" onClick={() => navigate("/")} />
            </div>
        </>
    );
}

export default BackHome;