using System.Text.Json.Serialization;

namespace Argon.Models
{
    public class CategoryNews
    {
        [JsonPropertyName("categoryName")]
        public string CategoryName { get; set; }

        [JsonPropertyName("newsCount")]
        public int NewsCount { get; set; }
    }


}
