import React from "react";
import UI_IMG from "../../assets/images/Logo_Societe_tunisienne_electricite_gaz.svg.png";


const AuthLayout = ({ children }) => {
    return <div className="flex">
        <div className="w-full max-w-5xl mx-auto pt-8 px-6">
            <h2 className="text-kg fo,t-medium text-black">Task Manager</h2>
            {children}
            </div>

            <div className="hidden md:flex w- [40vw] h-screen items-center justify-center ">
                <img src={UI_IMG} className="w-64 lg:w-[90%]" />
            </div>
            </div>
};

export default AuthLayout;