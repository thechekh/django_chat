import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  username: string;
}

export const getCurrentUsername = (): string => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return "";
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.username;
  } catch (error) {
    console.error("Error decoding token", error);
    return "";
  }
};