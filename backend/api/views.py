from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import industry_mapping, priority, main_industry ,urgency,affectedscope,national,continental,regional
from django.db import connection

import os
import requests
from django.http import JsonResponse
from dotenv import load_dotenv
load_dotenv()




@api_view(['GET'])
def get_priorities(request):
    priorities = list(priority.objects.values_list('name', flat=True))
    return Response({"priorities": priorities})

@api_view(['GET'])
def get_urgencies(request):
    urgencies = list(urgency.objects.values_list('name', flat=True))
    return Response({"urgencies": urgencies})

@api_view(['GET'])
def get_affectedscope(request):
    affectedscope_list = list(affectedscope.objects.values_list('name', flat=True))
    return Response({"affectedscope": affectedscope_list})


@api_view(['GET'])
def get_industries(request):
    industries = list(main_industry.objects.values_list('name', flat=True))
    return Response({"industries": industries})

@api_view(['GET'])
def get_national(request):
    nationalities = list(national.objects.values_list('country_name', flat=True))
    return Response({"national": nationalities})

@api_view(['GET'])
def get_continental(request):
    continentals = list(continental.objects.values_list('continent_name', flat=True))
    return Response({"continental": continentals})

@api_view(['GET'])
def get_regional(request):
    regionals = list(regional.objects.values_list('region_name', flat=True))
    return Response({"regional": regionals})





@api_view(['GET'])
def get_category(request, industry, category):
    valid_categories = [
        "subdomain",  
        "target_audience"
    ]
    
    # Make category lowercase and validate
    category = category.lower()
    if category not in valid_categories:
        return Response(
            {"detail": f"Invalid category '{category}'"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Normalize industry name to lowercase for consistency
        mapping = industry_mapping.objects.get(industry_name__iexact=industry)
        table_name = mapping.table_name.lower()
    except industry_mapping.DoesNotExist:
        return Response(
            {"detail": f"No table found for industry '{industry}'"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        with connection.cursor() as cursor:
            query = f"SELECT DISTINCT {category} FROM {table_name}"
            print("Executing query:", query)  # 🔍 Optional log
            cursor.execute(query)
            rows = [row[0] for row in cursor.fetchall() if row[0] is not None]
    except Exception as e:
        return Response(
            {"detail": f"Database error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    if not rows:
        return Response(
            {"detail": f"No data found for {category} in {industry}"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({category: rows})



@api_view(['POST'])
def generate_ideas(request):
    try:
        azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
        azure_key = os.getenv('AZURE_OPENAI_KEY')

        headers = {
            'Content-Type': 'application/json',
            'api-key': azure_key,
        }

        # Add model info to payload if needed
        payload = request.data.copy()
        payload["model"] = "gpt-4"  # adjust if needed
        if "max_tokens" in payload:
            payload["max_completion_tokens"] = payload.pop("max_tokens")
        payload.pop("temperature", None)

        response = requests.post(azure_endpoint, json=payload, headers=headers)

        print("Azure API Response Status Code:", response.status_code)
        print("Azure API Response Body:", response.text)

        response.raise_for_status()
        return Response(response.json(), status=response.status_code)

    except requests.exceptions.RequestException as e:
        error_message = f"Error communicating with Azure API: {str(e)}"
        print(error_message)
        return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



from .models import IdeaLog  # make sure you import

@api_view(['POST'])
def save_full_idea_log(request):
    try:
        data = request.data

        required_fields = [
            "focus", "main_industry", "subdomain", "target_Audience",
            "Location", "Urgency", "Priority",
            "generated_ideas"
        ]
        for field in required_fields:
            if field not in data:
                return Response({"detail": f"Missing field: {field}"}, status=400)

        log = IdeaLog.objects.create(
            focus=data["focus"],
            main_industry=data["main_industry"],
            subdomain=data["subdomain"],
            target_Audience=data["target_Audience"],
            Location=data["Location"],
            Urgency=data["Urgency"],
            Priority=data["Priority"],
            generated_ideas=data["generated_ideas"],
            
        )

        return Response({"message": "Idea log saved", "id": log.id}, status=201)

    except Exception as e:
        return Response({"detail": str(e)}, status=500)


# @api_view(['GET'])
# def get_focus_options(request):
#     return Response({
#         "focus_options": [
#             'I am trying to solve a problem','I want to create a new product','I want to improve an existing service','I want to disrupt an industry'
#         ]
#     })


# @api_view(['POST'])
# def save_selection(request):
#     required_fields = [
#          "main_industry", "subdomain", 
#          "Urgency"
#     ]

#     for field in required_fields:
#         if field not in request.data:
#             return Response({"detail": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         user_selection.objects.create(**{field: request.data[field] for field in required_fields})
#     except Exception as e:
#         return Response({"detail": f"Error saving selection: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     return Response({"message": "Selection saved successfully"})



# @api_view(['POST'])
# def save_full_idea_log(request):
#     try:
#         data = request.data

#         required_fields = [
#             "focus", "main_industry", "subdomain", "target_Audience",
#             "Location", "Urgency", "Priority",
#             "generated_ideas"
#         ]
#         for field in required_fields:
#             if field not in data:
#                 return Response({"detail": f"Missing field: {field}"}, status=400)

#         log = IdeaLog.objects.create(
#             focus=data["focus"],
#             main_industry=data["main_industry"],
#             subdomain=data["subdomain"],
#             target_Audience=data["target_Audience"],
#             Location=data["Location"],
#             Urgency=data["Urgency"],
#             Priority=data["Priority"],
#             generated_ideas=data["generated_ideas"],  # store as JSON or joined text
#             selected_problem=data.get("selected_problem", ""),
#             solution=data.get("solution", "")
#         )

#         return Response({"message": "Idea log saved", "id": log.id}, status=201)

#     except Exception as e:
#         return Response({"detail": str(e)}, status=500)


# @api_view(['POST'])
# def generate_ideas(request):
#     try:
#         print("Incoming request data:", request.data)

#         azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
#         azure_key = os.getenv('AZURE_OPENAI_KEY')

#         print("Azure Endpoint:", azure_endpoint)
#         print("Azure Key:", azure_key)

#         headers = {
#             'Content-Type': 'application/json',
#             'api-key': azure_key,
#         }

#         # Add model info to payload if needed
#         payload = request.data.copy()
#         payload["model"] = "gpt-4"  # adjust if needed
#         if "max_tokens" in payload:
#             payload["max_completion_tokens"] = payload.pop("max_tokens")
#         payload.pop("temperature", None)

#         response = requests.post(azure_endpoint, json=payload, headers=headers)

#         print("Azure API Response Status Code:", response.status_code)
#         print("Azure API Response Body:", response.text)

#         response.raise_for_status()
#         return Response(response.json(), status=response.status_code)

#     except requests.exceptions.RequestException as e:
#         error_message = f"Error communicating with Azure API: {str(e)}"
#         print(error_message)
#         return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['POST'])
# def generate_solution(request):
#     try:
#         azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
#         azure_key = os.getenv('AZURE_OPENAI_KEY')

#         headers = {
#             'Content-Type': 'application/json',
#             'api-key': azure_key,
#         }

#         # Add model to payload if needed
#         payload = request.data.copy()
#         payload["model"] = "gpt-4"  # optional depending on Azure setup
#         if "max_tokens" in payload:
#             payload["max_completion_tokens"] = payload.pop("max_tokens")
#         payload.pop("temperature", None)

#         response = requests.post(azure_endpoint, json=payload, headers=headers)

#         print("Azure API Response Status Code:", response.status_code)
#         print("Azure API Response Body:", response.text)

#         response.raise_for_status()
#         return Response(response.json(), status=response.status_code)

#     except requests.exceptions.RequestException as e:
#         error_message = f"Error communicating with Azure API: {str(e)}"
#         print(error_message)
#         return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
