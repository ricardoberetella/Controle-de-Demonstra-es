import { Operation, ClassRoom, DemonstrationStatus } from './types';

export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'muc-m-ta', name: 'MA' },
  { id: 'muc-m-tb', name: 'MB' },
  { id: 'muc-t-ta', name: 'TA' },
  { id: 'muc-t-tb', name: 'TB' },
];

export const INITIAL_OPERATIONS: Operation[] = [
  { id: '01', name: 'Facear no torno', category: 'Torno' },
  { id: '02', name: 'Tornear superf. cilíndrica na placa universal', category: 'Torno' },
  { id: '03', name: 'Facear rebaixo externo', category: 'Torno' },
  { id: '04', name: 'Chanfrar no torno', category: 'Torno' },
  { id: '05', name: 'Fazer furo de centro no torno', category: 'Torno' },
  { id: '06', name: 'Tornear superf. cilíndrica na placa univ. e contraponta', category: 'Torno' },
  { id: '07', name: 'Tornear canal externo', category: 'Torno' },
  { id: '08', name: 'Furar no torno com cabeçote móvel', category: 'Torno' },
  { id: '09', name: 'Escarear no torno', category: 'Torno' },
  { id: '10', name: 'Roscar com cossinete no torno', category: 'Torno' },
  { id: '11', name: 'Tornear superf. cônica com carro superior', category: 'Torno' },
  { id: '12', name: 'Roscar manualmente com macho no torno', category: 'Torno' },
  { id: '13', name: 'Recartilhar', category: 'Torno' },
  { id: '14', name: 'Cortar no torno', category: 'Torno' },
  { id: '15', name: 'Tornear superf. cilíndrica entre pontas', category: 'Torno' },
  { id: '16', name: 'Alargar furo no torno', category: 'Torno' },
  { id: '17', name: 'Tornear rosca triangular externa', category: 'Torno' },
  { id: '18', name: 'Tornear superf. cilíndrica interna passante', category: 'Torno' },
  { id: '19', name: 'Facear rebaixo interno', category: 'Torno' },
  { id: '20', name: 'Tornear rosca triangular interna', category: 'Torno' },
  { id: '21', name: 'Fresar superfície plana', category: 'Fresadora' },
  { id: '22', name: 'Fresar superfície plana paralela', category: 'Fresadora' },
  { id: '23', name: 'Limar superfície', category: 'Bancada' },
  { id: '24', name: 'Traçar retas com graminho e traçador de altura', category: 'Bancada' },
  { id: '25', name: 'Fresar superfície perpendicular', category: 'Fresadora' },
  { id: '26', name: 'Fresar rebaixos', category: 'Fresadora' },
  { id: '27', name: 'Fresar rasgos', category: 'Fresadora' },
  { id: '28', name: 'Puncionar', category: 'Bancada' },
  { id: '29', name: 'Furar na furadeira de coluna de bancada ou de piso', category: 'Furadeira' },
  { id: '30', name: 'Fresar superfície plana inclinada', category: 'Fresadora' },
  { id: '31', name: 'Rebaixar furo na furadeira de coluna de bancada ou de piso', category: 'Furadeira' },
  { id: '32', name: 'Roscar manualmente com macho na bancada', category: 'Bancada' },
  { id: '33', name: 'Escarear na furadeira de coluna de bancada ou de piso', category: 'Furadeira' },
  { id: '34', name: 'Serrar manualmente', category: 'Bancada' },
  { id: '35', name: 'Limar material fino', category: 'Bancada' },
  { id: '36', name: 'Dobrar material fino', category: 'Bancada' },
  { id: '37', name: 'Tornear perfil com ferramenta de forma', category: 'Torno' },
  { id: '38', name: 'Retificar superfície cilíndrica externa', category: 'Retificadora' },
  { id: '39', name: 'Balancear Rebolo', category: 'Retificadora' },
  { id: '40', name: 'Dressar Rebolo', category: 'Retificadora' },
  { id: '41', name: 'Fresar superfície plana paralela no aparelho divisor', category: 'Fresadora' },
  { id: '42', name: 'Furar de forma coordenada na fresadora', category: 'Fresadora' },
  { id: '43', name: 'Serrar com serra de fita', category: 'Bancada' },
  { id: '44', name: 'Alargar furo manualmente na bancada', category: 'Bancada' },
  { id: '45', name: 'Retificar superfície plana', category: 'Retificadora' },
  { id: '46', name: 'Retificar superfície plana paralela', category: 'Retificadora' },
  { id: '47', name: 'Retificar superfície plana perpendicular', category: 'Retificadora' },
];

export const getStatusColor = (status: DemonstrationStatus) => {
  switch (status) {
    case DemonstrationStatus.DONE: return 'bg-[#28a745]';
    default: return 'bg-white';
  }
};

export const getStatusText = (status: DemonstrationStatus) => {
  switch (status) {
    case DemonstrationStatus.DONE: return 'Demonstração OK';
    default: return 'Pendente';
  }
};
