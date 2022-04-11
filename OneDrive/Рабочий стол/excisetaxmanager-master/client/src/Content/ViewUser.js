import React from "react";
import usersData from '../data/usersData.json';
import {useParams} from "react-router-dom";
import '../App.css';

export default function ViewUser() {
    let { usersID } = useParams();
    const userItem = usersData.find(function(el) {
        if ( usersID == el.ID ) {
            return true;
        }
    });
    
    return ( 
        <div>
            <ul className="userItem">
                <li className="userItem_data"><img className="view-image" src={userItem.Image} /></li>
                <li className="userItem_data">
                    <li className="userItem_data userItem_data_padding">{userItem.fname}</li>
                    <li className="userItem_data userItem_data_padding">{userItem.lname}</li>
                    <li className="userItem_data userItem_data_padding">{userItem.username}</li>
                    <li className="userItem_data userItem_data_padding">{userItem.email}</li>
                    <li className="userItem_data userItem_data_padding">{userItem.position}</li>
                </li>
            </ul> 
        </div>
    );
}