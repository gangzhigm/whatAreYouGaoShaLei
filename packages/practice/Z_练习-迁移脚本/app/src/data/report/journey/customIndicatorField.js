import {translate as t} from '@/locales';

export const customIndicatorField = [
    {
        id: 'delivered',
        name: t('data.totalDelivered'),
        type: 'normal'
    },
    {
        id: 'sent',
        name: t('data.totalSend'),
        type: 'normal'
    },
    {
        id: 'hardbounce',
        name: t('data.totalHardBouncebacks'),
        type: 'normal'
    },
    {
        id: 'softbounce',
        name: t('data.totalSoftBouncebacks'),
        type: 'normal'
    },
    {
        id: 'softbounceProportion',
        name: t('data.softBouncesRate')
    },
    {
        id: 'click',
        name: t('data.clicksNum'),
        type: 'normal'
    },
    {
        id: 'unsubscribe',
        name: t('data.totalUnsubscribe'),
        type: 'normal'
    },
    {
        id: 'independentOpen',
        name: t('data.uniqueOpens'),
        type: 'normal'
    },
    {
        id: 'independentOpenProportion',
        name: t('data.independenceOpenRate')
    },
    {
        id: 'independentClick',
        name: t('data.independenceClicksNum'),
        type: 'normal'
    },
    {
        id: 'independentClickProportion',
        name: t('data.independenceClicksRate')
    },
    {
        id: 'uniqueEmailsRendered',
        name: t('data.uniqueEmailsRendered'),
        type: 'normal'
    }
];
