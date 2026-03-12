import dayjs from 'dayjs'

import { DATE_PAYLOAD_FORMAT } from '@/constants/date'

export const formatDateTime = (
    datetime: any,
    format: any = null,
    locale: any = null
) => {
    if (!format) {
        format = DATE_PAYLOAD_FORMAT
    }
    if (!locale) {
        locale = 'en'
    }
    return dayjs(datetime).tz().locale(locale).format(format)
}
