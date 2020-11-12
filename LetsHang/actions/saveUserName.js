import {EDIT_NAME} from './types'
export const saveUserName = (uName) =>(
{
	type:"EDIT_NAME",
	uName: uName
});
