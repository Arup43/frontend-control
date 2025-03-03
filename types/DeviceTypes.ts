export interface Device {
    id: string;
    status: string;
    isActive: boolean;
    hasLike: boolean;
    hasComment: boolean;
    hasShare: boolean;
    hasStream: boolean;
}
  
export interface DevicesResponse {
    devices: Device[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export interface DeviceStats {
    totalActiveDevices: number;
    executionOngoing: number;
    executionCompleted: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalStream: number;
}