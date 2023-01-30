// 日历chart
import {translate as t} from '@/locales';

export function getCalendarChart(year, successData, errorData, successCount, errorCount) {
    let yearLabel = {
            show: false,
        },
        monthLabel = {
            position: 'bottom',
            nameMap: [
                t('time.January'), t('time.February'), t('time.March'), t('time.April'), t('time.May'), t('time.June'), t('time.July'), t('time.August'), t('time.September'), t('time.October'), t('time.November'), t('time.December')
            ],
        },
        dayLabel = {
            firstDay: 1,
            nameMap: [t('dataCenter.Sun'), t('dataCenter.Mon'), t('dataCenter.Tues'), t('dataCenter.Wed'),
                t('dataCenter.Thur'), t('dataCenter.Fri'), t('dataCenter.Sat')]
        },
        splitLine = {
            show: true,
            lineStyle: {
                color: '#fff',
                width: 10,
            },
        },
        itemStyle = {
            color: '#e0e5ea',
            borderColor: '#fff',
            borderWidth: 1,
        };

    return {
        tooltip: {
            position: 'top',
            formatter: function (params) {
                let text = params.data[1] ? t('dataCenter.success') : t('dataCenter.failure');
                return params.data[0] + ' : ' + text;
            }
        },
        legend: {
            position: 'top',
            top: 20,
            data: [t('dataCenter.successCount') + successCount, t('dataCenter.failureCount') + errorCount],
        },
        calendar: [
            {
                range: year,
                cellSize: 'auto',
                yearLabel,
                monthLabel,
                dayLabel,
                splitLine,
                itemStyle,
            },
        ],

        series: [
            {
                name: t('dataCenter.successCount') + successCount,
                type: 'heatmap',
                color: '#0cc2a9',
                coordinateSystem: 'calendar',
                calendarIndex: 0,
                data: successData,
            },
            {
                name: t('dataCenter.failureCount') + errorCount,
                type: 'heatmap',
                color: '#eb5150',
                coordinateSystem: 'calendar',
                calendarIndex: 0,
                data: errorData,
            },
        ]

    };
}
