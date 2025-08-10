import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, changePassword } from "./userSlice";

const useUserProfile = () => {
  const dispatch = useDispatch();
  const { user, authLoading, error } = useSelector((state) => state.user);

  return {
    user,
    authLoading,
    error,
    fetchProfile: () => dispatch(fetchProfile()),
    updateProfile: (data) => dispatch(updateProfile(data)),
    changePassword: (data) => dispatch(changePassword(data)),
  };
};

export default useUserProfile;
