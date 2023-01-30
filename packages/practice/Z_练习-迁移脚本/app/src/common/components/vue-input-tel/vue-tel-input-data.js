// create form chutt 2019-12-23
import {allCountriesEN} from '../vue-input-tel/vue-tel-input-data-en';
import {allCountriesZH} from '../vue-input-tel/vue-tel-input-data-zh';
import {LANGUAGE_PREFERENCE} from '@/locales';

const lang = localStorage.getItem(LANGUAGE_PREFERENCE);

export let allCountries = lang === 'en' ? allCountriesEN : allCountriesZH;

// loop over all of the countries above, restructuring the data to be objects with named keys
for (let i = 0; i < allCountries.length; i++) {
    let c = allCountries[i];
    allCountries[i] = {
        name: c[0],
        iso2: c[1].toUpperCase(),
        dialCode: c[2],
        priority: c[3] || 0,
        areaCodes: c[4] || null
    };
}
