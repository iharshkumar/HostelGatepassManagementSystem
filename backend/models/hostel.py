from typing import Dict, Any, Optional

class HostelModel:
    collection_name = "hostels"

    @staticmethod
    def create_hostel_doc(
        hostel_name: str,
        warden_name: str,
        capacity: int = 100,
        occupied_rooms: int = 0
    ) -> Dict[str, Any]:
        return {
            "hostelName": hostel_name,
            "wardenName": warden_name,
            "capacity": capacity,
            "occupiedRooms": occupied_rooms
        }
