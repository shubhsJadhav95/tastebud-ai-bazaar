
import React from "react";
import { Link } from "react-router-dom";
import { User, Store } from "lucide-react";

interface LoginCardProps {
  type: "customer" | "restaurant";
  title: string;
  description: string;
}

const LoginCard: React.FC<LoginCardProps> = ({ type, title, description }) => {
  const Icon = type === "customer" ? User : Store;
  const linkTo = type === "customer" ? "/customer/login" : "/restaurant/login";
  const bgColor = type === "customer" ? "bg-food-primary" : "bg-food-secondary";
  const hoverColor = type === "customer" ? "hover:bg-orange-600" : "hover:bg-teal-600";

  return (
    <div className="food-card w-full max-w-sm mx-auto p-6 flex flex-col items-center">
      <div className={`rounded-full ${bgColor} p-4 mb-6`}>
        <Icon size={32} className="text-white" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 text-center mb-6">{description}</p>
      <Link 
        to={linkTo} 
        className={`w-full ${bgColor} text-white font-semibold py-3 px-4 rounded-md shadow-sm ${hoverColor} transition-all text-center`}
      >
        Continue as {title}
      </Link>
    </div>
  );
};

export default LoginCard;
