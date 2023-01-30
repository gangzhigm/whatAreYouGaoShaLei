/**
 * Created by Administrator on 2017/8/3.
 */

const autoScroll = {
    
    $calendars: [],
    
    _reposition() {
        if (autoScroll.$calendars.length) {
            autoScroll.$calendars.forEach(calendar => calendar.datetimepicker('place'));
        }
    },
    
    watch($calendar) {
        this.$calendars.indexOf($calendar) === -1 && this.$calendars.push($calendar);
        if (this.$calendars.length === 1) window.addEventListener('scroll', this._reposition, true);
    },
    
    stop($calendar) {
        const targetIdx = this.$calendars.indexOf($calendar);
        if (targetIdx !== -1) this.$calendars.splice(targetIdx, 1);
        if (this.$calendars.length === 0) window.removeEventListener('scroll', this._reposition, true);
    }
    
};

export default autoScroll;
