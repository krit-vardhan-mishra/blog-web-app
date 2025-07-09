import CardBox from "./ui/CardBox";
import { PenLine, FileTextIcon, Trash, Users, ArrowRightCircle } from "lucide-react";

export const FeaturesSidebar = () => {
  return (
    <div className="flex flex-col items-start justify-center p-4 sm:p-6 xl:p-10 w-full h-full xl:overflow-y-auto">
      <div className="flex flex-col items-start gap-4 xl:gap-6 w-full">
        <CardBox 
          title={"Your space to write, express, and connect."} 
          icon={PenLine} 
          content={"Build, manage, and grow your personal blog with ease."} 
        />
        <CardBox 
          title={"Create & Share Posts"} 
          icon={FileTextIcon} 
          content={"Your space to write, express and connect."} 
        />
        <CardBox 
          title={"Edit or Delete Anytime"} 
          icon={Trash} 
          content={"Easily update your content or remove posts whenever you like you're in full control."} 
        />
        <CardBox 
          title={"Manage Users & Role"} 
          icon={Users} 
          content={"Different roles for admins, writers, and readers ensure secure and flexible content management."} 
        />
        <CardBox 
          title={"Get Started Now"} 
          icon={ArrowRightCircle} 
          content={"Log in to your account to start creating and managing your blogs today."} 
        />
      </div>
    </div>
  );
};

export default FeaturesSidebar;
