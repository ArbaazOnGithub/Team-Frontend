import React from 'react';
import RequestCard from './RequestCard';

const RequestList = ({ requests, user, changeStatus, deleteRequest, formatDate }) => {
    return (
        <div className="flex flex-col gap-4 pb-8">
            {requests.map(req => (
                <RequestCard
                    key={req._id}
                    req={req}
                    user={user}
                    changeStatus={changeStatus}
                    deleteRequest={deleteRequest}
                    formatDate={formatDate}
                />
            ))}
        </div>
    );
};

export default RequestList;
