import { generateOTP } from "@utilities/otp.js"

describe("Otp Unit test",() => {

    it('Should get the otp code between 100000 and 999999', () => {
         const otp = generateOTP();
         expect(otp).toBeGreaterThan(100000);
         expect(otp).toBeLessThan(999999);
    })
})