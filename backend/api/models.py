# models.py
from django.db import models
from django.utils import timezone


class main_industry(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'main_industry'  # use existing table name

class industry_mapping(models.Model):
    industry_name = models.CharField(max_length=100, primary_key=True)
    table_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'industry_mapping'



class priority(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'priority'  # use existing table name


class urgency(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'urgency'  # use existing table name

class affectedscope(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'affectedscope'  # use existing table name


class national(models.Model):
    country_name = models.CharField(max_length=100)

    class Meta:
        db_table = "national"


class continental(models.Model):
    continent_name = models.CharField(max_length=100)

    class Meta:
        db_table = "continental"



class regional(models.Model):
    region_name = models.CharField(max_length=100)

    class Meta:
        db_table = "regional"





# models.py
class IdeaLog(models.Model):
    focus = models.CharField(max_length=100)
    main_industry = models.CharField(max_length=100)
    subdomain = models.CharField(max_length=100)
    target_Audience = models.CharField(max_length=100)
    Location = models.CharField(max_length=100)
    Urgency = models.CharField(max_length=100)
    Priority = models.CharField(max_length=100)

    generated_ideas = models.TextField()  # Save generated text
    

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'idea_log'


# class user_selection(models.Model):
#     focus = models.CharField(max_length=100)
#     main_industry = models.CharField(max_length=100)
#     subdomain = models.CharField(max_length=100)
#     target_Audience = models.CharField(max_length=100)
#     Location = models.CharField(max_length=100)
#     Urgency = models.CharField(max_length=100)
#     Priority = models.CharField(max_length=100)
#     created_at = models.DateTimeField( default=timezone.now)

#     class Meta:
#         db_table = 'user_selection'

    
# class IdeaLog(models.Model):
#     focus = models.CharField(max_length=100)
#     main_industry = models.CharField(max_length=100)
#     subdomain = models.CharField(max_length=100)
#     target_Audience = models.CharField(max_length=100)
#     Location = models.CharField(max_length=100)
#     Urgency = models.CharField(max_length=100)
#     Priority = models.CharField(max_length=100)

#     generated_ideas = models.TextField()  # Save raw text or JSON string of ideas
#     selected_problem = models.TextField(blank=True, null=True)
#     solution = models.TextField(blank=True, null=True)

#     created_at = models.DateTimeField( default=timezone.now)

#     class Meta:
#         db_table = 'idea_log'

