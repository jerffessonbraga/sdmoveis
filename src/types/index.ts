export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROMOB = 'PROMOB',
  CONTRACTS = 'CONTRACTS',
  CRM = 'CRM',
  CLIENT_PORTAL = 'CLIENT_PORTAL',
  PORTFOLIO = 'PORTFOLIO',
  TIME_TRACKING = 'TIME_TRACKING',
  FLEET = 'FLEET',
  AFTER_SALES = 'AFTER_SALES',
}

export enum ToolMode {
  SELECT = 'SELECT',
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
}

export enum ViewportMode {
  PERSPECTIVE = 'PERSPECTIVE',
  TOP = 'TOP',
  FRONT = 'FRONT',
  SIDE = 'SIDE',
}

export interface ProjectDimensions {
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
}

export interface ProjectSettings {
  floorTexture: string;
  wallColor: string;
  ceilingVisible: boolean;
}

export interface FurnitureModule {
  id: string;
  type: string;
  category: string;
  price: number;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  finish: string;
  isRipado: boolean;
  rotation: number;
  isAppliance?: boolean;
  applianceType?: 'fridge' | 'stove' | 'washing_machine' | 'microwave' | 'range_hood' | 'sink';
  hasGlass?: boolean;
  handleType?: 'bar' | 'knob' | 'pull' | 'shell';
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  settings: ProjectSettings;
}

export interface Contract {
  id: string;
  clientName: string;
  document: string;
  projectName: string;
  value: number;
  status: 'Em Negociação' | 'Assinado' | 'Produção' | 'Instalação' | 'Concluído';
  date: string;
  email: string;
  phone: string;
  paymentStatus: 'Pendente' | 'Parcial' | 'Pago';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin' | 'client' | 'ai';
  text: string;
  time: string;
}

export interface ModuleTemplate {
  id: string;
  type: string;
  category: string;
  price: number;
  icon: string;
  w: number;
  h: number;
  d: number;
  z: number;
  isAppliance?: boolean;
  applianceType?: 'fridge' | 'stove' | 'washing_machine' | 'microwave' | 'range_hood' | 'sink';
  hasGlass?: boolean;
  handleType?: 'bar' | 'knob' | 'pull' | 'shell';
}
