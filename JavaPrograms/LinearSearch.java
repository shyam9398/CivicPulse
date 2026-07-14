public class LinearSearch {
    public static void main(String[] args) {
        int[] arr = {5, 12, 18, 24, 30};
        int key = 18;
        boolean found = false;

        for (int num : arr) {
            if (num == key) {
                found = true;
                break;
            }
        }

        if (found)
            System.out.println("Element Found");
        else
            System.out.println("Element Not Found");
    }
}
