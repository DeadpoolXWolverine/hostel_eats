import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderHistory } from "../../services/customerAPI";
import { formatDate } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";
import Pagination from "../common/Pagination";
import Spinner from "../common/Spinner";
import { SiTicktick } from "react-icons/si";
import ViewDetailsModal from "../common/ViewDetailsModal";

const Orders = () => {
    
    const orderHistory = useSelector(store => store.orderHistory);
    const [currentItems,setCurrentItems] = useState(null);
    const [loading,setLoading] = useState(false);
    const [isOpen,setIsOpen] = useState(false);
    const [showOrder,setShowOrder] = useState(null);
    const dispatch = useDispatch();

    useEffect(()=>{
        setLoading(true);
        getOrderHistory(dispatch).then(()=> setLoading(false));
    },[]);

    const handleToggleViewDetails = (order)=>{
        setShowOrder(order);
        setIsOpen(!isOpen);
    }

    return (
        <div className="flex flex-col items-center relative">
            {loading ? <div className="mt-[35%] sm:mt-[12%] sm:-ml-[15%]"><Spinner/></div>
            :<div className="w-[95%] xl:w-[90%] flex flex-col items-center -mt-5 sm:mt-0" id="orderHistory">
                <h1 className="-ml-[52%] sm:-ml-[64%] md:-ml-[72%] lg:-ml-[65%] xl:-ml-[77%] text-xl md:text-2xl lg:text-3xl font-semibold">Order History</h1>
                {!orderHistory.length 
                ? <div className="mt-[30%] sm:mt-[15%] text-xl sm:text-3xl font-bold uppercase tracking-wider">
                    No Orders Found
                </div>
                :<> 
                    <div className="grid grid-cols-2 w-full mt-5">
                        {currentItems?.map( (order) =>{
                            const date = formatDate(order.createdAt.split('T')[0]);
                            const time = formatTime(order.createdAt.split('T')[1].split(':')[0]+":"+order.createdAt.split('T')[1].split(':')[1]);
                            // const items = order.items.map(item => item.item.name + " x " + item.quantity).join(', ');
                            return (
                            <div key={order._id} className="col-span-full md:col-span-1 bg-[#31363F] py-4 px-4 w-[90%] mx-4 md:mx-0 lg:mx-10 mt-12 rounded-lg">
                                {order.status!=='completed' && <div className="absolute -mt-12 -ml-3 flex items-center gap-2">
                                    <div className="size-5 border-2 border-orange-700 rounded-full flex items-center justify-center animate-pulse">
                                        <div className="size-3 bg-orange-700 rounded-full"/>    
                                    </div>
                                    <h1 className="text-base">Live Order</h1>
                                </div>}
                                <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-7 md:items-center">
                                    <img src={order.items[0].item.imageUrl} alt="dish-img" className="lg:w-40 xl:w-52 w-full sm:w-[95%] h-40 sm:h-56 md:h-[50%] lg:h-28 xl:h-32 object-fill rounded-lg"/>
                                    <div className="space-y-1 mt-3 lg:mt-0 md:-ml-10 lg:ml-0">
                                        <h1 className="text-lg">{order.canteenName}</h1>
                                        <p className="text-sm md:text-xs lg:text-[.65rem] xl:text-xs">{"ORDER#"+order._id}</p>
                                        <p className="text-sm lg:text-xs xl:text-sm">{date + ", "  + time}</p>
                                        <button onClick={()=>{ handleToggleViewDetails(order)}}>View Details</button>
                                    </div>
                                </div>
                                <div className="relative flex flex-row gap-4 lg:gap-5 xl:gap-10 mt-4 md:-left-1 lg:left-2 xl:left-4 whitespace-nowrap text-xs sm:text-base md:text-xs  lg:text-sm xl:text-base">
                                    <div className="flex flex-col items-center space-y-2">
                                        <h1>Order Received</h1>
                                        <SiTicktick className='text-green-600'/>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <h1>Cooking</h1>
                                        <SiTicktick className={`${order.status!=='pending'?'text-green-600':''}`}/>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <h1>Pick Up</h1>
                                        <SiTicktick className={`${(order.status!=='pending' && order.status!=='preparing')?'text-green-600':''}`}/>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <h1>Completed</h1>
                                        <SiTicktick className={`${(order.status==='completed')?'text-green-600':''}`}/>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-row gap-6 lg:gap-10 whitespace-nowrap text-sm lg:text-base">
                                    <h1>{"Total Bill: ₹" + order.totalAmount}</h1>
                                    <h1>{"Payment Method: " + order.paymentstatus}</h1>
                                    {/* {order.status==='completed' && <button className="uppercase tracking-wider">Reorder</button>} */}
                                </div>
                            </div>);
                        })}
                    </div>
                    {isOpen && <ViewDetailsModal close={handleToggleViewDetails} order={showOrder}/>}
                    <Pagination allItems={orderHistory} itemsPerPage={10} setCurrentItems={setCurrentItems} scrollTo={"orderHistory"}/>
                </>}
            </div>}
        </div>
    )
}

export default Orders
