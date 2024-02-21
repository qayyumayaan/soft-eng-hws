const {
    dateCreator,
    bigValidator,
    yearIsValid,
    monthIsValid,
    dayIsValid,
    hourIsValid,
    minIsValid,
    secondIsValid,
    interpretAsInteger,
  } = require("./dateFunctions");
  
  describe("dateCreator function", () => {
    it("should return a formatted date when given a valid input", () => {
      const inputString = "20220129T123456";
      const result = dateCreator(inputString);
      expect(result).toBeDefined();
    });
  
    it("should return undefined when given an invalid input", () => {
      const invalidInputs = [
        "2022-01-29T12:34:56", // Invalid format
        "20220129T123",       // Incorrect length
        "2022AB29T123456",    // Non-numeric characters
      ];
      
      for (const input of invalidInputs) {
        const result = dateCreator(input);
        expect(result).toBeUndefined();
      }
    });
  });
  
  describe("bigValidator function", () => {
    it("should return true for valid date and time components", () => {
      expect(bigValidator("2022", "01", "29", "12", "34", "56")).toBe(true);
    });
  
    it("should return false for invalid year", () => {
      const invalidYears = ["abcd", "-2022", "10000", "999"];
      for (const year of invalidYears) {
        expect(bigValidator(year, "01", "29", "12", "34", "56")).toBe(false);
      }
    });
  
    it("should return false for invalid month", () => {
      const invalidMonths = ["00", "13", "abcd"];
      for (const month of invalidMonths) {
        expect(bigValidator("2022", month, "29", "12", "34", "56")).toBe(false);
      }
    });
  
    it("should return false for invalid day", () => {
      const invalidDays = ["00", "32", "abcd"];
      for (const day of invalidDays) {
        expect(bigValidator("2022", "01", day, "12", "34", "56")).toBe(false);
      }
    });
  
    it("should return false for invalid hour", () => {
      const invalidHours = ["-1", "24", "abcd"];
      for (const hour of invalidHours) {
        expect(bigValidator("2022", "01", "29", hour, "34", "56")).toBe(false);
      }
    });
  
    it("should return false for invalid minute", () => {
      const invalidMinutes = ["-1", "60", "abcd"];
      for (const min of invalidMinutes) {
        expect(bigValidator("2022", "01", "29", "12", min, "56")).toBe(false);
      }
    });
  
    it("should return false for invalid second", () => {
      const invalidSeconds = ["-1", "60", "abcd"];
      for (const sec of invalidSeconds) {
        expect(bigValidator("2022", "01", "29", "12", "34", sec)).toBe(false);
      }
    });
  });
  
  describe("yearIsValid function", () => {
    it("should return false for non-numeric year", () => {
      expect(yearIsValid("abcd")).toBe(false);
    });
  
    it("should return false for negative year", () => {
      expect(yearIsValid("-2022")).toBe(false);
    });
  
    it("should return true for valid year", () => {
      expect(yearIsValid("2022")).toBe(true);
    });
  });
  
  describe("monthIsValid function", () => {
    it("should return false for non-numeric month", () => {
      expect(monthIsValid("abcd")).toBe(false);
    });
  
    it("should return false for month < 1", () => {
      expect(monthIsValid("00")).toBe(false);
    });
  
    it("should return false for month > 12", () => {
      expect(monthIsValid("13")).toBe(false);
    });
  
    it("should return true for valid month", () => {
      expect(monthIsValid("01")).toBe(true);
      expect(monthIsValid("12")).toBe(true);
    });
  });
  
  describe("dayIsValid function", () => {
    it("should return false for invalid day in February (leap year)", () => {
      expect(dayIsValid("02", "30", "2024")).toBe(false);
    });
  
    it("should return false for invalid day in February (non-leap year)", () => {
      expect(dayIsValid("02", "29", "2023")).toBe(false);
    });
  
    it("should return false for non-numeric day", () => {
      expect(dayIsValid("01", "abcd", "2022")).toBe(false);
    });
  
    it("should return false for day < 1", () => {
      expect(dayIsValid("01", "00", "2022")).toBe(false);
    });
  
    it("should return false for day > maximum day of the month", () => {
      expect(dayIsValid("02", "30", "2022")).toBe(false);
      expect(dayIsValid("04", "31", "2022")).toBe(false);
      expect(dayIsValid("06", "31", "2022")).toBe(false);
      expect(dayIsValid("09", "31", "2022")).toBe(false);
      expect(dayIsValid("11", "31", "2022")).toBe(false);
    });
  
    it("should return true for valid day", () => {
      expect(dayIsValid("01", "31", "2022")).toBe(true);
      expect(dayIsValid("02", "29", "2024")).toBe(true);
      expect(dayIsValid("04", "30", "2022")).toBe(true);
      expect(dayIsValid("06", "30", "2022")).toBe(true);
      expect(dayIsValid("09", "30", "2022")).toBe(true);
      expect(dayIsValid("11", "30", "2022")).toBe(true);
    });
  });
  
  describe("hourIsValid function", () => {
    it("should return false for non-numeric hour", () => {
      expect(hourIsValid("abcd")).toBe(false);
    });
  
    it("should return false for hour < 0", () => {
      expect(hourIsValid("-1")).toBe(false);
    });
  
    it("should return false for hour > 23", () => {
      expect(hourIsValid("24")).toBe(false);
    });
  
    it("should return true for valid hour", () => {
      expect(hourIsValid("00")).toBe(true);
      expect(hourIsValid("12")).toBe(true);
      expect(hourIsValid("23")).toBe(true);
    });
  });
  
  describe("minIsValid function", () => {
    it("should return false for non-numeric minute", () => {
      expect(minIsValid("abcd")).toBe(false);
    });
  
    it("should return false for minute < 0", () => {
      expect(minIsValid("-1")).toBe(false);
    });
  
    it("should return false for minute > 59", () => {
      expect(minIsValid("60")).toBe(false);
    });
  
    it("should return true for valid minute", () => {
      expect(minIsValid("00")).toBe(true);
      expect(minIsValid("30")).toBe(true);
      expect(minIsValid("59")).toBe(true);
    });
  });
  
  describe("secondIsValid function", () => {
    it("should return false for non-numeric second", () => {
      expect(secondIsValid("abcd")).toBe(false);
    });
  
    it("should return false for second < 0", () => {
      expect(secondIsValid("-1")).toBe(false);
    });
  
    it("should return false for second > 59", () => {
      expect(secondIsValid("60")).toBe(false);
    });
  
    it("should return true for valid second", () => {
      expect(secondIsValid("00")).toBe(true);
      expect(secondIsValid("30")).toBe(true);
      expect(secondIsValid("59")).toBe(true);
    });
  });
  
  describe("interpretAsInteger function", () => {
    it("should interpret a numeric string correctly", () => {
      expect(interpretAsInteger("123")).toBe(123);
    });
  
    it("should handle leading zeros in a numeric string", () => {
      expect(interpretAsInteger("007")).toBe(7);
    });
  });  