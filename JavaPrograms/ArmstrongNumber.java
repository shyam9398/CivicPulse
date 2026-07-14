public class ArmstrongNumber {
    public static void main(String[] args) {
        int num = 153, original = num, sum = 0;

        while (num != 0) {
            int digit = num % 10;
            sum += digit * digit * digit;
            num /= 10;
        }

        if (sum == original)
            System.out.println(original + " is an Armstrong Number");
        else
            System.out.println(original + " is not an Armstrong Number");
    }
}
