namespace ProjectManagementSystem.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public int? AssignedToId { get; set; }
        public User AssignedTo { get; set; }
    }
}