import { printANSI } from '@/utils/screenLog';

export default function Initializer () {
    if (process.env.NODE_ENV === 'beta' || process.env.NODE_ENV === 'dev') {
        // beta/dev服开发控制台打印
        printANSI(); 
    }
}
