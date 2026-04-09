import React from 'react';
import Header from '../components/landing/Header';
import CampusMap from '../components/map/CampusMap';

export default function ExplorePage({ session }) {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <Header session={session} minimal={true} />
            <main className="flex-1 relative">
                <CampusMap 
                    initialZoom={17} 
                    hideMarkers={true} 
                />
            </main>
        </div>
    );
}
