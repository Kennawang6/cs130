import {EDIT_USER} from './types'
export const saveUserInfo = (userInfo) =>(
{
	type:"EDIT_USER",
	userInfo: {
		uName: userInfo.uName,
		uTimeZone: userInfo.uTimeZone,
		uPhoto: userInfo.uPhoto,
		uEmail: userInfo.uEmail
	}
});
