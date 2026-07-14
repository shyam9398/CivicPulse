public class LargestNumber {
    public static void main(String[] args) {
        int a = 12, b = 25, c = 18;

        if (a >= b && a >= c)
            System.out.println("Largest = " + a);
        else if (b >= a && b >= c)
            System.out.println("Largest = " + b);
        else
            System.out.println("Largest = " + c);
    }
}
