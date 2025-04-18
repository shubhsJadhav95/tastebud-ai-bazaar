
import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface ProfileInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
}

const ProfileInput: React.FC<ProfileInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  icon
}) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        {icon}
      </div>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};

export default ProfileInput;
