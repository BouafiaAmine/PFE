import React, { useContext, useState } from 'react'
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import AuthLayout from '../../components/layouts/AuthLayouts';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [fullName, setFullName] =useState("");
    const [email, setEmail] =useState("");
    const [password, setPassword] =useState("");
    const [adminInviteToken, setAdminInviteToken] =useState("");
    const {updateUser} = useContext(UserContext);

    const navigate = useNavigate();

    const [error, setError] = useState(null);

    
        // Handle SignUp Form Submit
        const handleSignUp = async (e) => {
            e.preventDefault();

            let profileImageUrl = ''
    
            if (!fullName.trim()) {
                setError ("Please enter full name.");
                return;
            }

            if (!validateEmail(email)) {
                setError ("Please enter a valid email address!");
                return;
            }     
    
        if (!password) {
            setError("please enter the password");
            return;
        }
        
        setError("");
        // SignUp API call
        try {

            //Upload image if available
            if (profilePic) {
                const imgUploadRes = await uploadImage(profilePic);
                profileImageUrl = imgUploadRes.imageUrl || "";
            }

        const response= await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            name: fullName,
            email,
            password,
            profileImageUrl,
            adminInviteToken
        });

        const { token, role } = response.data;

        if (token) {
            localStorage.setItem("token", token);
            updateUser(response.data);

            //Redirect based on role
            if (role === "admin") {
                navigate("/admin/dashboard"); 
            } else {
                navigate("/user/dashboard");
        }
           
    }
        }catch (error){
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
        
         
        };


    
return (
    <AuthLayout>
        <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-black">Create an Account</h3>
            <p className="text-xs text-slate-700 mt-[5px] mb-6">
                Join your team today by creating an account
            </p>

            <form onSubmit={handleSignUp}>
                <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                    value={fullName}
                    onChange={({ target }) => setFullName(target.value)}
                    label="Full Name"
                    placeholder="Amine"
                    type="text"
                    />

                    <Input
                    value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    label="Email Address"
                    placeholder="amine@example.com"
                    type="text"
                    />

                  <Input
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  label="Password"
                  placeholder="Min 8 Characters"
                  type="password"
                  />

                   <Input
                  value={adminInviteToken}
                  onChange={({ target }) => setAdminInviteToken(target.value)}
                  label="Admin Invite Code"
                  placeholder="7 digit code"
                  type="text"
                  />
                      </div>

                 {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                 <button type="submit" className="btn-primary">
                 SIGN UP
                </button>

                <p className="text-[13px] text-slate-800 mt-3">
                Already have an account? {" "}
               <Link className="font-medium text-primary underline" to="/login">
                Login
               </Link>
               </p>       
            </form>
        </div>
    </AuthLayout>
)
}

export default SignUp;