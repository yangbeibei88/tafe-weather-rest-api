import { ObjectId } from "mongodb";

interface Device {
  _id: ObjectId;
  deviceName: string;
  type: string;
  emailAddress: string;
  model: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
  lastLoggedInAt?: Date;
}

type DeviceWithoutId = Omit<Device, "_id">;
