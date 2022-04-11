const { getTimezoneDiffernence, getMonthRangeForTimezoneISOString } = require("./dateHelper")
describe("DateHelper", () => {
    describe("Timezone defference calculator getTimezoneDiffernence", () => {
        test("Compares Asia/Yerevan America/Los_Angeles zone offset differnece", () => {

            const los_angeles_offset = getTimezoneDiffernence('America/Los_Angeles')
            const yerevan_offset = getTimezoneDiffernence('Asia/Yerevan')
            
            const diffenerence = los_angeles_offset + yerevan_offset;

            expect(Math.sign(diffenerence) * diffenerence).toEqual(660);

        });
    });


    describe("Month range by timezone calculator getMonthRangeForTimezoneISOString", () => {
        test("Calculates range of month 1 (January) for America/Los_Angeles", () => {

            expect(getMonthRangeForTimezoneISOString(2021, 1, 'America/Los_Angeles')).toEqual({ from: '2021-01-01T07:00:00.000Z', to: '2021-02-01T07:00:00.000Z' });

        })

        test("Calculates range of month 12 (December) for Asia/Yerevan", () => {

            expect(getMonthRangeForTimezoneISOString(2021, 12, 'Asia/Yerevan')).toEqual({ from: '2021-11-30T20:00:00.000Z', to: '2021-12-31T20:00:00.000Z' });

        })
    })
})