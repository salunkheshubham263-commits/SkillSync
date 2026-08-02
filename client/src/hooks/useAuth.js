import {useContext} from 'react'
import { AuthContext } from '../context/Auth_context';

export default function useAuth () {
    return useContext(AuthContext);
}