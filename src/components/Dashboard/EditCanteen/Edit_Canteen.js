import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCanteenDetails } from "../../../services/ownerAPI";
import CanteenDetails from "./CanteenDetails";
import { useDispatch, useSelector } from "react-redux";
import MenuItems from "./MenuItems";
import Spinner from "../../common/Spinner";
import { setCanteenDetails } from "../../../slices/canteenSlice";

const Edit_Canteen = () => {

  const {id} = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const {canteenDetails} = useSelector(store => store.canteen);
  //This is it know which btn is working currently meaning if editItem is true then currently we are editing menu item and no other btn will work
  const [btnState,setBtnState] = useState({editCanteen:false,editItem:false,addItem:false});
  useEffect(()=>{
    getCanteenDetails(id,dispatch);
    return ()=>{
      dispatch(setCanteenDetails(null));
    }
  },[id]);

  useEffect(()=>{
    const params = new URLSearchParams(location.search);
    if (params.get('scrollToMenu') === 'true') {
      const menuItemsElement = document.getElementById('menu-items-section');
      if (menuItemsElement) {
        menuItemsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },[location])

  return (
    <div className="flex flex-col justify-center items-center">
      {!canteenDetails ? <div className="mt-[10%] -ml-[15%]"><Spinner/></div> 
      : <>
          <CanteenDetails btnState={btnState} setBtnState={setBtnState}/>
          <div id="menu-items-section" className="w-full">
            <MenuItems btnState={btnState} setBtnState={setBtnState}/>
          </div>
      </>}
    </div>
  )
}

export default Edit_Canteen