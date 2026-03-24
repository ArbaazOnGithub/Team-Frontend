import RequestCard from './RequestCard';
import Skeleton from '../Common/Skeleton';

const RequestList = ({ requests, user, changeStatus, deleteRequest, formatDate, loading }) => {
    return (
        <div className="flex flex-col gap-4 pb-8">
            {loading ? (
                <>
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </>
            ) : (
                requests?.map(req => (
                    <RequestCard
                        key={req._id}
                        req={req}
                        user={user}
                        changeStatus={changeStatus}
                        deleteRequest={deleteRequest}
                        formatDate={formatDate}
                    />
                ))
            )}
        </div>
    );
};

export default RequestList;
