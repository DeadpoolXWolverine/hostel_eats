import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { updateOrderStatus, getCanteenDetails, getOrderHistory } from "../../services/ownerAPI";
import { formatTime } from "../../utils/formatTime";
import { PieChart } from "react-minimal-pie-chart";
import Spinner from "../common/Spinner";
import { setCanteenDetails } from "../../slices/canteenSlice";
import { formatDate } from "../../utils/formatDate";
import { setOrderHistory } from "../../slices/orderHistorySlice";
import Pagination from "../common/Pagination";
import ViewDetailsModal from "../common/ViewDetailsModal";

const CanteenDashboard = () => {

    const {id} = useParams();
    const dispatch = useDispatch();
    const canteenDetails = useSelector(store => store.canteen.canteenDetails);
    const orderHistory = useSelector(store => store.orderHistory);
    const [currentItems,setCurrentItems] = useState(null);
    const [isOpen,setIsOpen] = useState(false);
    const [showOrder,setShowOrder] = useState(null);
    
    useEffect(()=>{
        getOrderHistory({shopid:id},dispatch);
        getCanteenDetails(id,dispatch);
        
        return ()=>{
            dispatch(setCanteenDetails(null));
            dispatch(setOrderHistory([]));
            // socket.disconnect();
        }
    },[id]);

    const inputStyle = "bg-[#31363F] w-[90%] lg:w-[80%] px-2 py-2 rounded-md mt-2";
    const data = [
        { title: 'Online', value: 10, color: '#E38627' },
        { title: 'Cash', value: 15, color: '#C13C37' },
    ];

    const handleToggleViewDetails = (order)=>{
        setShowOrder(order);
        setIsOpen(!isOpen);
    }

    const handleAccept = (e,id)=>{
        e.stopPropagation();
        const formData = new FormData();
        formData.append("orderid",id);
        formData.append("status","preparing");
        updateOrderStatus(formData).then(()=>{
            const updatedOrderHistory = orderHistory.map((order)=> order._id===id ? {...order,status:"preparing"}: order);
            dispatch(setOrderHistory(updatedOrderHistory));
        });
    }

    const handlePrepared = (id)=>{
        const formData = new FormData();
        formData.append("orderid",id);
        formData.append("status","prepared");
        updateOrderStatus(formData).then(()=>{
            const updatedOrderHistory = orderHistory.map((order)=> order._id===id ? {...order,status:"prepared"}: order);
            dispatch(setOrderHistory(updatedOrderHistory));
        });
    }

    const handlePickedUp = (id)=>{
        const formData = new FormData();
        formData.append("orderid",id);
        formData.append("status","completed");
        updateOrderStatus(formData).then(()=>{
            const updatedOrderHistory = orderHistory.map((order)=> order._id===id ? {...order,status:"completed"}: order);
            dispatch(setOrderHistory(updatedOrderHistory));
        });
    }

    return (
    <div className="flex flex-col justify-center items-center">
        {!canteenDetails? <div className="mt-[10%] -ml-[15%]"><Spinner/></div> 
        : <div className="w-[85%] h-fit pb-12 mt-14 relative">
            <h1 className="relative -mt-[22%] sm:-mt-[17%] md:-mt-[15%] lg:-mt-[17%] xl:-mt-[7%] sm:-ml-3 md:-ml-4 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">Canteen Dashboard</h1>
            <div className="grid grid-cols-12 w-full">
                <div className="col-span-12 sm:col-span-7 grid grid-cols-2">
                    <div className="col-span-1 mt-5 sm:mt-8 text-sm lg:text-base flex flex-col">
                        <label>Canteen Name</label>
                        <input type="text" name='canteenName' className={`${inputStyle}`} value={canteenDetails.canteenName}
                        disabled={true}/>
                    </div>
                    <div className="col-span-1 mt-5 sm:mt-8 text-sm lg:text-base flex flex-col">
                        <label>Canteen Address</label>
                        <input type="text" name='address' className={`${inputStyle}`} value={canteenDetails.address}
                        disabled={true}/>
                    </div>
                    <div className="col-span-1 mt-5 sm:mt-8 text-sm lg:text-base flex flex-col">
                        <label>Opening Time</label>
                        <input type="text" name='openingTime' className={`${inputStyle}`} value={formatTime(canteenDetails.openingTime)}
                        disabled={true}/>
                    </div>
                    <div className="col-span-1 mt-5 sm:mt-8 text-sm lg:text-base flex flex-col">
                        <label>Closing Time</label>
                        <input type="text" name='closingTime' className={`${inputStyle}`} value={formatTime(canteenDetails.closingTime)}
                        disabled={true}/>
                    </div>
                </div>
                <div className="col-span-12 sm:col-span-5 flex flex-col items-center space-y-10 mt-5 sm:mt-0">
                    <div className="grid grid-cols-2">
                        <h1 className="col-span-1 flex items-center">Total Revenue</h1>
                        <PieChart data={data} className="ml-5 size-28 col-span-1"/>
                    </div>
                    <div className="grid grid-cols-2">
                        <h1 className="col-span-1 flex items-center">This Month Revenue</h1>
                        <PieChart data={data} className="ml-7 size-28 col-span-1"/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center mt-10" id="orderHistory">
                <h1 className="-ml-2 sm:-ml-3 md:-ml-5 lg:-ml-[87%] text-2xl">Order History</h1>
                {!orderHistory.length ? <div>No Order Found</div>
                :<>  
                    <div className="grid grid-cols-2 w-full mt-5 ml-7 sm:ml-0">
                        {currentItems?.map( (order) =>{
                            const date = order.createdAt ? formatDate(order.createdAt.split('T')[0]) : '';
                            const time = order.createdAt ? formatTime(order.createdAt?.split('T')[1].split(':')[0]+":"+order.createdAt.split('T')[1].split(':')[1]) : '';
                            // const items = order.items.map(item => item.item.name + " x " + item.quantity).join(', ');
                            return (
                            <div key={order._id} className="col-span-full sm:col-span-1 bg-[#31363F] py-4 px-4 w-[90%] xl:w-[85%] mt-11 rounded-lg">
                                {order.status!=='completed' && <div className="absolute -mt-12 -ml-3 flex items-center gap-2">
                                    <div className="size-4 sm:size-5 border-2 border-orange-700 rounded-full flex items-center justify-center animate-pulse">
                                        <div className="size-2 sm:size-3 bg-orange-700 rounded-full"/>    
                                    </div>
                                    <h1 className="text-sm sm:text-base">Live Order</h1>
                                </div>}
                                <div className="flex flex-row gap-7">
                                    <img src={order.items[0].item.imageUrl} alt="dish-img" className="hidden sm:block w-40 h-28 object-fill"/>
                                    <div className="space-y-1">
                                        <p className="text-xs">{"ORDER#"+order._id}</p>
                                        <p className="text-xs sm:text-sm">{date + ", "  + time}</p>
                                        <p className="text-sm">{"status: " + order.status}</p>
                                        <button onClick={()=>{ handleToggleViewDetails(order)}}>View Details</button>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-row gap-4 sm:gap-7 items-center">
                                    <h1 className="whitespace-nowrap text-xs sm:text-base">{"Total Bill: ₹" + order.totalAmount}</h1>
                                    {order.status==='pending' && <>
                                        <button className="bg-[#76ABAE] w-16 sm:w-24 py-1 rounded-md sm:rounded-lg sm:ml-12 text-xs sm:text-base" onClick={(e)=>handleAccept(e,order._id)}>Accept</button>
                                        <button className="bg-red-600 w-16 sm:w-24 py-1 rounded-md sm:rounded-lg text-xs sm:text-base">Reject</button>
                                    </>}
                                    {order.status==='preparing' && <button className="bg-[#76ABAE] w-16 sm:w-24 py-1 rounded-md sm:rounded-lg sm:ml-12 text-xs sm:text-base" onClick={()=>handlePrepared(order._id)}>Prepared</button>}
                                    {order.status==='prepared' && <button className="bg-[#76ABAE] w-16 sm:w-24 py-1 rounded-md sm:rounded-lg sm:ml-12 text-xs sm:text-base" onClick={()=>handlePickedUp(order._id)}>Picked Up</button>}
                                </div>
                            </div>);
                        })}
                    </div>
                    {isOpen && <ViewDetailsModal close={handleToggleViewDetails} order={showOrder}/>}
                    {orderHistory && <span className="-ml-20"><Pagination allItems={orderHistory} itemsPerPage={10} setCurrentItems={setCurrentItems} scrollTo={'orderHistory'}/></span>}
                </>}
            </div>
        </div>}
    </div>
    )
}

export default CanteenDashboard
